import { supabase } from './supabase'

export interface UploadResult {
  data?: {
    path: string
    fullPath: string
    publicUrl: string
  }
  error?: Error
}

export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<UploadResult> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        error: new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return {
        error: new Error('File size too large. Please upload an image smaller than 5MB.')
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `profile-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Delete existing profile pictures for this user
    const { data: existingFiles } = await supabase.storage
      .from('profile-pictures')
      .list(userId)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`)
      await supabase.storage
        .from('profile-pictures')
        .remove(filesToDelete)
    }

    // Upload new file
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return { error }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)

    return {
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl
      }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Upload failed')
    }
  }
}

export const deleteProfilePicture = async (userId: string): Promise<{ error?: Error }> => {
  try {
    // List all files for the user
    const { data: files, error: listError } = await supabase.storage
      .from('profile-pictures')
      .list(userId)

    if (listError) {
      return { error: listError }
    }

    if (files && files.length > 0) {
      const filesToDelete = files.map(file => `${userId}/${file.name}`)
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove(filesToDelete)

      if (deleteError) {
        return { error: deleteError }
      }
    }

    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Delete failed')
    }
  }
}

export const getProfilePictureUrl = (userId: string, fileName?: string): string | null => {
  if (!fileName) return null
  
  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(`${userId}/${fileName}`)
  
  return data.publicUrl
}