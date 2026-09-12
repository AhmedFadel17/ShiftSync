import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string
    name: string
    icon?: string
    error?: string
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
    ({ label, name, icon, error, ...props }, ref) => {

        const textareaClass = `w-full bg-white/5 border rounded-xl py-4 pr-4 text-white placeholder:text-white/20
      focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/40 focus:outline-none
      transition-all font-body resize-none min-h-[100px] ${icon ? 'pl-12' : 'pl-4'}
      ${error ? 'border-red-500/60 ring-2 ring-red-500/20' : 'border-white/10'}`

        return (
            <div className="space-y-2 w-full">
                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                    {label}
                </label>
                <div className="relative group">
                    {icon && (
                        <span className="material-symbols-outlined absolute left-4 top-4 text-white/30 group-focus-within:text-accent-cyan transition-colors text-xl">
                            {icon}
                        </span>
                    )}
                    <textarea
                        ref={ref}
                        name={name}
                        className={textareaClass}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-red-400 text-[10px] uppercase tracking-wider ml-1">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

TextAreaField.displayName = 'TextAreaField'