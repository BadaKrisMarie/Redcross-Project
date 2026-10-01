import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, ArrowLeft } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const email = data.email.trim();
        const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!looksLikeEmail) {
            setEmailExists(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setCheckingEmail(true);
            try {
                const res = await axios.post(route('check.email'), { email });
                setEmailExists(res.data.exists);
            } catch (err) {
                setEmailExists(false);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [data.email]);

    const submit = (e) => {
        e.preventDefault();
        if (emailExists) return;
        post(route('register'));
    };

    const isBlocked = emailExists || processing;



    return (
        <GuestLayout
            title="Create Volunteer Account"
            subtitle="Join the humanitarian mission in Muntinlupa City"
            maxWidth="max-w-xl"
        >
            <Head title="Volunteer Registration - Philippine Red Cross" />

            <form onSubmit={submit} className="space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <div className="relative">
                            <TextInput
                                id="first_name"
                                type="text"
                                name="first_name"
                                value={data.first_name}
                                className="pl-10"
                                placeholder="Juan"
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                            />
                            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <InputError message={errors.first_name} className="mt-1.5" />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <div className="relative">
                            <TextInput
                                id="last_name"
                                type="text"
                                name="last_name"
                                value={data.last_name}
                                className="pl-10"
                                placeholder="Dela Cruz"
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                            />
                            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <InputError message={errors.last_name} className="mt-1.5" />
                    </div>
                </div>

                {/* Email Address */}
                <div>
                    <InputLabel htmlFor="email" value="Email Address" />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10"
                            placeholder="juan@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {checkingEmail && (
                        <p className="text-xs text-gray-500 mt-1 font-medium">Checking email availability...</p>
                    )}
                    {emailExists && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                            This email is already registered. Please sign in instead.
                        </p>
                    )}
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Mobile Number */}
                <div>
                    <InputLabel htmlFor="phone" value="Mobile Number" />
                    <div className="relative">
                        <TextInput
                            id="phone"
                            type="tel"
                            name="phone"
                            value={data.phone}
                            className="pl-10"
                            placeholder="09171234567"
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <InputError message={errors.phone} className="mt-1.5" />
                </div>

                {/* Address */}
                <div>
                    <InputLabel htmlFor="address" value="Residential Address / Barangay" />
                    <div className="relative">
                        <TextInput
                            id="address"
                            type="text"
                            name="address"
                            value={data.address}
                            className="pl-10"
                            placeholder="Barangay, Muntinlupa City"
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <InputError message={errors.address} className="mt-1.5" />
                </div>

                {/* Password & Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <div className="relative">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="pl-10 pr-10"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                        <div className="relative">
                            <TextInput
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="pl-10 pr-10"
                                placeholder="••••••••"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1.5" />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                    <PrimaryButton className="w-full" disabled={isBlocked}>
                        {processing ? 'Registering...' : 'Complete Registration'}
                    </PrimaryButton>
                </div>

                {/* Login Link */}
                <div className="text-center pt-2">
                    <p className="text-xs text-gray-600 font-normal">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-red-600 hover:text-red-700 transition-colors"
                        >
                            Sign In Here
                        </Link>
                    </p>
                </div>

                {/* Back to Home Link */}
                <div className="text-center pt-3 border-t border-gray-100">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}