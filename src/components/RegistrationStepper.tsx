import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface RegistrationStepperProps {
  currentStep: number
  allCompleted?: boolean
  steps: {
    id: number
    name: string
    description: string
    icon: React.ComponentType<any>
  }[]
}

export default function RegistrationStepper({ currentStep, allCompleted = false, steps }: RegistrationStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id && !allCompleted
            const isCompleted = allCompleted || currentStep > step.id
            const isUpcoming = currentStep < step.id && !allCompleted

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: isCompleted 
                        ? '#10b981' 
                        : isActive 
                        ? '#3b82f6' 
                        : '#e5e7eb',
                      scale: isActive ? 1.1 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 relative
                      ${isCompleted 
                        ? 'border-green-500 bg-green-500' 
                        : isActive 
                        ? 'border-primary-500 bg-primary-500' 
                        : 'border-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    ) : (
                      <step.icon 
                        className={`h-6 w-6 ${
                          isActive 
                            ? 'text-white' 
                            : isUpcoming 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                        }`} 
                      />
                    )}
                  </motion.div>

                  {/* Step Info */}
                  <div className="mt-3 text-center">
                    <motion.h3
                      animate={{
                        color: isActive || isCompleted ? '#1f2937' : '#9ca3af'
                      }}
                      className="text-sm font-medium dark:text-white"
                    >
                      {step.name}
                    </motion.h3>
                    <motion.p
                      animate={{
                        color: isActive || isCompleted ? '#6b7280' : '#d1d5db'
                      }}
                      className="text-xs mt-1 dark:text-gray-400"
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: allCompleted || currentStep > step.id ? '#10b981' : '#e5e7eb'
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 h-0.5 mx-4 mt-[-20px]"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 