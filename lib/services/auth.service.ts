import { userRepository } from '@/lib/repositories/user.repository'
import type { SignupRequest, LoginRequest, AuthResponse } from '@/lib/types/auth'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/utils/jwt'
import bcrypt from 'bcryptjs'

export class AuthService {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      // Check if username already exists
      const existingUser = await userRepository.findByUsername(data.username)
      if (existingUser) {
        return {
          success: false,
          message: 'Username sudah digunakan',
        }
      }

      // Create user
      const user = await userRepository.create({
        username: data.username,
        password: data.password,
        email: data.email || null,
        full_name: data.full_name || null,
        role: 'user',
      })

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        role: user.role,
      })

      const refreshToken = generateRefreshToken({
        id: user.id,
        username: user.username,
        role: user.role,
      })

      // Remove password from response
      const { password, ...userWithoutPassword } = user

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        message: 'Registrasi berhasil',
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat registrasi',
      }
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt for username:', username)

      // Find user
      const user = await userRepository.findByUsername(username)
      if (!user) {
        console.log('❌ User not found:', username)
        return {
          success: false,
          message: 'Username atau password salah',
        }
      }

      console.log('✅ User found:', username, 'ID:', user.id)

      // Check if user is active
      if (!user.is_active) {
        console.log('❌ User is not active:', username)
        return {
          success: false,
          message: 'Akun Anda tidak aktif',
        }
      }

      console.log('🔍 Verifying password...')

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', username)
        return {
          success: false,
          message: 'Username atau password salah',
        }
      }

      console.log('✅ Password valid for user:', username)

      // Update last login
      await userRepository.updateLastLogin(user.id)

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        role: user.role,
      })

      const refreshToken = generateRefreshToken({
        id: user.id,
        username: user.username,
        role: user.role,
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        message: 'Login berhasil',
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat login',
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken)

      // Find user to make sure it still exists and is active
      const user = await userRepository.findById(payload.id)
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan',
        }
      }

      if (!user.is_active) {
        return {
          success: false,
          message: 'Akun Anda tidak aktif',
        }
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        role: user.role,
      })

      return {
        success: true,
        data: {
          user,
          accessToken: newAccessToken,
          refreshToken, // Keep the same refresh token
        },
        message: 'Token berhasil diperbaharui',
      }
    } catch (error: any) {
      console.error('Refresh token error:', error)
      return {
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa',
      }
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find user with password
      const user = await userRepository.findByUsername(
        (await userRepository.findById(userId))?.username || ''
      )

      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan',
        }
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Password lama salah',
        }
      }

      // Update password
      await userRepository.update(userId, { password: newPassword })

      return {
        success: true,
        message: 'Password berhasil diubah',
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat mengubah password',
      }
    }
  }
}

export const authService = new AuthService()
