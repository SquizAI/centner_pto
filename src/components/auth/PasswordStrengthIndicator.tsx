'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

export default function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const requirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
  }, [password])

  const strength = useMemo(() => {
    const passed = Object.values(requirements).filter(Boolean).length
    if (passed === 0) return { level: 0, label: '', color: 'bg-gray-200' }
    if (passed <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (passed <= 3) return { level: 2, label: 'Fair', color: 'bg-orange-500' }
    if (passed <= 4) return { level: 3, label: 'Good', color: 'bg-yellow-500' }
    return { level: 4, label: 'Strong', color: 'bg-green-500' }
  }, [requirements])

  if (!password) return null

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          {strength.label && (
            <span className={`text-xs font-semibold ${
              strength.level === 1 ? 'text-red-600' :
              strength.level === 2 ? 'text-orange-600' :
              strength.level === 3 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                level <= strength.level ? strength.color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5 text-xs">
          <RequirementItem met={requirements.minLength}>
            At least 8 characters
          </RequirementItem>
          <RequirementItem met={requirements.hasUpperCase}>
            One uppercase letter
          </RequirementItem>
          <RequirementItem met={requirements.hasLowerCase}>
            One lowercase letter
          </RequirementItem>
          <RequirementItem met={requirements.hasNumber}>
            One number
          </RequirementItem>
          <RequirementItem met={requirements.hasSpecialChar}>
            One special character (!@#$%^&*)
          </RequirementItem>
        </div>
      )}
    </div>
  )
}

function RequirementItem({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 transition-colors ${
      met ? 'text-green-600' : 'text-gray-500'
    }`}>
      {met ? (
        <Check className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span>{children}</span>
    </div>
  )
}
