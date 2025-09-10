import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, MessageCircle, Send, X, User, Mail } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import emailjs from '@emailjs/browser';

interface FeedbackFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'bug' | 'feature' | 'improvement' | 'question' | 'other';
}

// EmailJS Configuration - All values configured
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_c1qhexh',        // Your EmailJS service ID
  TEMPLATE_ID: 'template_a5mtdh8',      // Your EmailJS template ID
  PUBLIC_KEY: 'FGgvoLlR7xfXljWKB'       // Your EmailJS public key
};

const FeedbackPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { success, error } = useNotifications();
  
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'improvement'
  });

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: '🐛' },
    { value: 'feature', label: 'Feature Request', icon: '✨' },
    { value: 'improvement', label: 'Improvement', icon: '📈' },
    { value: 'question', label: 'Question', icon: '❓' },
    { value: 'other', label: 'Other', icon: '💬' }
  ];

  const handleInputChange = (field: keyof FeedbackFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      error('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email using EmailJS
      const templateParams = {
        to_email: 'MikeA@WichitaKenworth.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject || 'No subject provided',
        message: formData.message,
        category: categories.find(c => c.value === formData.category)?.label || formData.category,
        timestamp: new Date().toLocaleString()
      };

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      if (result.status === 200) {
        // Reset form and show success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'improvement'
        });
        
        setShowForm(false);
        success('Feedback Sent', 'Your feedback has been sent to Mike successfully!');
      } else {
        throw new Error('EmailJS returned non-200 status');
      }
      
    } catch (err) {
      console.error('EmailJS failed, falling back to mailto:', err);
      
      // Fallback to mailto if EmailJS fails
      const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Category: ${categories.find(c => c.value === formData.category)?.label}
Subject: ${formData.subject || 'No subject provided'}

Message:
${formData.message}

---
Sent from WKI Service Management App
Time: ${new Date().toISOString()}
      `.trim();

      const mailtoLink = `mailto:MikeA@WichitaKenworth.com?subject=${encodeURIComponent(
        `[WKI App Feedback] ${formData.subject || categories.find(c => c.value === formData.category)?.label}`
      )}&body=${encodeURIComponent(emailBody)}`;

      // Open email client as fallback
      window.location.href = mailtoLink;
      
      // Reset form and show fallback message
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'improvement'
      });
      
      setShowForm(false);
      success('Email Client Opened', 'Your email client should open with the feedback ready to send');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setShowForm(false);
    }
  };

  return (
    <div className="lg:w-full mt-4">
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Feedback toggle clicked, current state:', isExpanded);
          togglePanel();
        }}
        className="w-full p-2 xl:p-3 flex items-center justify-center hover:bg-slate-700/50 transition-colors duration-200 relative lg:rounded-lg border border-slate-600/30 hover:border-slate-500/50"
        aria-label={isExpanded ? 'Minimize Feedback' : 'Expand Feedback'}
      >
        {isExpanded ? (
          <div className="flex items-center lg:flex-col lg:space-y-1">
            <span className="text-lg font-semibold text-blue-300 mr-2 lg:mr-0 lg:mb-1">Feedback</span>
            <ChevronRight className="w-6 h-6 xl:w-8 xl:h-8 text-blue-400 lg:hidden" />
            <ChevronLeft className="w-6 h-6 xl:w-8 xl:h-8 text-blue-400 hidden lg:block" />
          </div>
        ) : (
          <div className="flex items-center lg:flex-col lg:space-y-1">
            <span className="text-lg font-semibold text-blue-400 mr-2 lg:mr-0 lg:mb-1">Feedback</span>
            <div className="flex items-center">
              <MessageCircle className="w-6 h-6 xl:w-8 xl:h-8 text-blue-400 animate-pulse lg:mb-1" />
              <ChevronLeft className="w-5 h-5 xl:w-6 xl:h-6 text-blue-400 ml-1 lg:ml-0" />
            </div>
          </div>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="lg:fixed lg:top-20 lg:right-4 w-full lg:w-80 xl:w-96 p-3 xl:p-4 lg:bg-slate-900 lg:border lg:border-slate-600/30 lg:rounded-lg lg:shadow-2xl lg:z-50 max-h-96 lg:max-h-[calc(100vh-6rem)] overflow-y-auto">
          
          {!showForm ? (
            /* Feedback Options */
            <div className="space-y-3">
              <div className="mb-3 xl:mb-4 hidden lg:block">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-blue-300 mb-2">Share Your Feedback</h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Feedback main panel X clicked');
                      setIsExpanded(false);
                    }}
                    className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  Help us improve the WKI Service Management App
                </p>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-200 transform hover:scale-105 group"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <h4 className="text-white font-semibold">Send Feedback</h4>
                    <p className="text-blue-100 text-sm">Report issues, suggest features, or ask questions</p>
                  </div>
                  <Send className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 4).map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: category.value as any }));
                      setShowForm(true);
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-200 text-center border border-slate-600 hover:border-blue-500/50"
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-xs text-slate-300">{category.label}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                  📧 Feedback sent to MikeA@WichitaKenworth.com
                </p>
              </div>
            </div>
          ) : (
            /* Feedback Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-300">Send Feedback</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Feedback form X clicked');
                    setShowForm(false);
                    setIsExpanded(false);
                  }}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Your name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    placeholder="FirstL@WichitaKenworth.com"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Brief description"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none h-24 resize-none"
                    placeholder="Describe your feedback, suggestion, question, or issue..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;