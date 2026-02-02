"use client";

import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="text-2xl font-extrabold text-slate-900 mb-4">
                            ZapFlux
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Automate your workflows with the power of AI.
                            Built for modern engineering teams.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Features</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Integrations</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Pricing</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Enterprise</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Careers</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Blog</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Terms of Service</li>
                            <li className="hover:text-purple-600 cursor-pointer transition-colors">Cookie Policy</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500">
                        © 2026 ZapFlux Inc. All rights reserved.
                    </div>
                    
                    <div className="flex gap-6">
                        <SocialIcon icon={<Github className="w-5 h-5" />} />
                        <SocialIcon icon={<Twitter className="w-5 h-5" />} />
                        <SocialIcon icon={<Linkedin className="w-5 h-5" />} />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <div className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
            {icon}
        </div>
    )
}