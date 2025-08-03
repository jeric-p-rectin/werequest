"use client"
import { useState } from 'react'

export default function CreateAccountMockup() {
    const [showPopup, setShowPopup] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        middleName: '',
        lastName: ''
    })
    const [errors, setErrors] = useState<{[key: string]: string}>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        }
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }
        if (!formData.middleName.trim()) {
            newErrors.middleName = 'Middle name is required'
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateAccount = () => {
        if (!validateForm()) {
            return // Don't proceed if validation fails
        }
        
        // Simulate successful account creation
        // In a real app, you would make an API call here
        console.log('Creating account with:', formData)
        
        // Show the success popup
        setShowPopup(true)
        
        // Auto-hide popup after 3 seconds
        // setTimeout(() => {
        //     setShowPopup(false)
        // }, 3000)
    }

    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div className="absolute inset-0 bg-gradient-to-t from-[#34450e]/80 via-[#4d5f30]/60 to-transparent z-10" />
            <form className="z-20 flex flex-col w-full bg-white max-w-md px-8 py-10 rounded-lg items-center justify-center">
                <img 
                    src="/images/logo.png" 
                    alt="Logo" 
                    width={200}
                    height={200}
                    className="rounded-full border-4 border-[#4d5f30] mb-2"
                />
                <div className="w-full space-y-1">
                    <div className="w-full">
                        <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className={`w-full p-2 border rounded-3xl text-sm text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition ${
                                errors.email ? 'border-red-500' : 'border-[#4d5f30]'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>
                        )}
                    </div>
                    <div className="w-full">
                        <label htmlFor="firstName" className="block text-sm font-medium text-black">First Name</label>
                        <input 
                            type="text" 
                            id="firstName" 
                            name="firstName" 
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter your first name"
                            className={`w-full p-2 border rounded-3xl text-sm text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition ${
                                errors.firstName ? 'border-red-500' : 'border-[#4d5f30]'
                            }`}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1 ml-2">{errors.firstName}</p>
                        )}
                    </div>
                    <div className="w-full">
                        <label htmlFor="middleName" className="block text-sm font-medium text-black">Middle Name</label>
                        <input 
                            type="text" 
                            id="middleName" 
                            name="middleName" 
                            value={formData.middleName}
                            onChange={handleInputChange}
                            placeholder="Enter your middle name"
                            className={`w-full p-2 border rounded-3xl text-sm text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition ${
                                errors.middleName ? 'border-red-500' : 'border-[#4d5f30]'
                            }`}
                        />
                        {errors.middleName && (
                            <p className="text-red-500 text-xs mt-1 ml-2">{errors.middleName}</p>
                        )}
                    </div>
                    <div className="w-full">
                        <label htmlFor="lastName" className="block text-sm font-medium text-black">Last Name</label>
                        <input 
                            type="text" 
                            id="lastName" 
                            name="lastName" 
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter your last name"
                            className={`w-full p-2 border rounded-3xl text-sm text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition ${
                                errors.lastName ? 'border-red-500' : 'border-[#4d5f30]'
                            }`}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1 ml-2">{errors.lastName}</p>
                        )}
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={handleCreateAccount}
                    className="block mt-6 w-full cursor-pointer text-sm text-white text-center py-3 rounded-3xl transition duration-300 ease-in-out bg-[#80eb15] hover:bg-[#3c5e1a] disabled:bg-gray-400"
                >
                    Create Account
                </button>
            </form>

            {/* Success Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-gradient-to-t from-[#34450e]/80 via-[#4d5f30]/30 to-transparent flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl relative">
                        {/* Close button (X) */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="cursor-pointer absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* Logo at the top */}
                        <div className="flex justify-center mb-4">
                            <img 
                                src="/images/logo.png" 
                                alt="Logo" 
                                width={80}
                                height={80}
                                className="rounded-full border-2 border-[#4d5f30]"
                            />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-center text-gray-900 mb-3">
                            Account Created Successfully!
                        </h3>
                        
                        <p className="text-sm text-gray-600 text-center leading-relaxed">
                            Please wait for your username and password to your email, since the account is waiting for approval to create thankyou
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}