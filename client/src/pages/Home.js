import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/axios';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  GraduationCap,
  Globe,
  Shield,
  Smartphone,
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Search,
  Users,
  Flag,
  Lightbulb,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const studyCountryOptions = [
  { value: 'United Kingdom (UK)', label: 'United Kingdom (UK)', flag: '🇬🇧' },
  { value: 'United States (USA)', label: 'United States (USA)', flag: '🇺🇸' },
  { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
  { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'Ireland', label: 'Ireland', flag: '🇮🇪' },
  { value: 'France', label: 'France', flag: '🇫🇷' },
  { value: 'Singapore', label: 'Singapore', flag: '🇸🇬' },
  { value: 'New Zealand', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'India', label: 'India', flag: '🇮🇳' }
];

const universityOptions = [
  'University Of California Davis',
  'Columbia University',
  'University Of North Texas',
  'Western Carolina University',
  'Arizona State University',
  'School Of Visual Arts',
  'Harvard University',
  'Massachusetts Institute of Technology',
  'University of Toronto',
  'London School of Economics',
  'University of Oxford',
  'University of Cambridge',
  'National University of Singapore',
  'Technical University of Munich',
  'Australian National University'
];

const admissionStatusOptions = [
  {
    value: 'applied',
    title: 'Applied',
    description: 'Completed the application process with university'
  },
  {
    value: 'confirmed',
    title: 'Confirmed',
    description: 'Availed offer letter from the university'
  },
  {
    value: 'not_applied',
    title: 'Not Applied yet',
    description: 'Planning to apply soon...'
  }
];

const intakeOptions = ['Jan 2026', 'May 2026', 'Sep 2026', 'Jan 2027'];

const loanRangeOptions = [
  '₹8 - ₹10 lacs',
  '₹11 - ₹20 lacs',
  '₹21 - ₹30 lacs',
  '₹31 - ₹50 lacs',
  'More than ₹50 lacs'
];

const stepConfig = [
  { title: 'Study Destination', subtitle: 'Choose where you plan to study' },
  { title: 'Admission Status', subtitle: 'Tell us your university progress' },
  { title: 'Intake Plan', subtitle: 'Share your target intake' },
  { title: 'Preferred University', subtitle: 'Pick your dream university' },
  { title: 'Loan Requirement', subtitle: 'Select your expected loan range' },
  { title: 'Contact Details', subtitle: 'Help us reach you quickly' }
];

function EligibilityWizard({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    studyCountry: '',
    admissionStatus: '',
    intake: '',
    universityPreference: '',
    loanRange: '',
    fullName: '',
    email: '',
    phone: '',
    city: ''
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [universitySearch, setUniversitySearch] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownAnimation, setDropdownAnimation] = useState(false);
  const countryDropdownRef = useRef(null);
  const countryListRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setFormData({
        studyCountry: '',
        admissionStatus: '',
        intake: '',
        universityPreference: '',
        loanRange: '',
        fullName: '',
        email: '',
        phone: '',
        city: ''
      });
      setCountrySearch('');
      setUniversitySearch('');
      setError('');
      setSubmitting(false);
      setSubmittedLead(null);
      setIsCountryDropdownOpen(false);
      setHighlightedIndex(-1);
      setDropdownAnimation(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isCountryDropdownOpen) {
      setTimeout(() => setDropdownAnimation(true), 10);
    } else {
      setDropdownAnimation(false);
    }
  }, [isCountryDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return studyCountryOptions;
    const searchLower = countrySearch.trim().toLowerCase();
    return studyCountryOptions.filter((option) =>
      option.label.toLowerCase().includes(searchLower)
    );
  }, [countrySearch]);

  const popularCountries = useMemo(() => {
    return studyCountryOptions.filter(c => 
      ['United States (USA)', 'United Kingdom (UK)', 'Canada', 'Australia', 'Germany'].includes(c.value)
    );
  }, []);

  const highlightMatch = (text, search) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0 2px', borderRadius: '2px' }}>
          {part}
        </mark>
      ) : part
    );
  };

  const filteredUniversities = useMemo(() => {
    if (!universitySearch.trim()) return universityOptions;
    return universityOptions.filter((option) =>
      option.toLowerCase().includes(universitySearch.trim().toLowerCase())
    );
  }, [universitySearch]);

  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    if (field === 'studyCountry') {
      setIsCountryDropdownOpen(false);
      setCountrySearch('');
      setHighlightedIndex(-1);
    }
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      if (currentStep < stepConfig.length - 1) {
        setCurrentStep((prev) => Math.min(prev + 1, stepConfig.length - 1));
      }
    }, 300);
  };

  const handleCountryKeyDown = (e) => {
    if (!isCountryDropdownOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsCountryDropdownOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    const countriesToNavigate = countrySearch 
      ? filteredCountries 
      : studyCountryOptions.filter(c => !popularCountries.some(p => p.value === c.value));
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < countriesToNavigate.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < countriesToNavigate.length) {
          handleSelect('studyCountry', countriesToNavigate[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsCountryDropdownOpen(false);
        setCountrySearch('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && countryListRef.current) {
      const items = countryListRef.current.children;
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [highlightedIndex]);

  const validateStep = () => {
    setError('');
    switch (currentStep) {
      case 0:
        if (!formData.studyCountry) {
          setError('Select a country to continue');
          return false;
        }
        return true;
      case 1:
        if (!formData.admissionStatus) {
          setError('Select your current admission status');
          return false;
        }
        return true;
      case 2:
        if (!formData.intake) {
          setError('Select your intake to continue');
          return false;
        }
        return true;
      case 3:
        if (!formData.universityPreference) {
          setError('Select a preferred university to continue');
          return false;
        }
        return true;
      case 4:
        if (!formData.loanRange) {
          setError('Select your required loan range');
          return false;
        }
        return true;
      case 5: {
        if (!formData.fullName.trim()) {
          setError('Please enter your full name');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Please enter your email address');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          setError('Enter a valid email address');
          return false;
        }
        if (!formData.phone.trim()) {
          setError('Please provide your phone number so we can reach you');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, stepConfig.length - 1));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onClose();
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        studyCountry: formData.studyCountry,
        admissionStatus: formData.admissionStatus,
        intake: formData.intake,
        universityPreference: formData.universityPreference,
        loanRange: formData.loanRange,
        city: formData.city.trim() || undefined
      };
      const response = await apiClient.post('/api/leads', payload);
      if (response.data && response.data.lead) {
        setSubmittedLead(response.data.lead);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Enquiry submission error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Full error:', err);
      
      // Show more detailed error message from server
      let message = 'Failed to submit enquiry. Please try again.';
      if (err.response?.data?.error) {
        message = err.response.data.error;
        // If there are details, append them in a readable format
        if (err.response.data.details) {
          if (Array.isArray(err.response.data.details)) {
            const detailMessages = err.response.data.details.map(d => 
              d.message || `${d.path || 'field'}: ${d.message || 'Invalid value'}`
            ).join('. ');
            if (detailMessages) {
              message = `${message}. ${detailMessages}`;
            }
          } else if (typeof err.response.data.details === 'object') {
            // For object details, show the message if available
            const detailMsg = err.response.data.details.message || 
                             (err.response.data.details.name ? `${err.response.data.details.name}: ${err.response.data.details.message || 'Error'}` : '');
            if (detailMsg) {
              message = `${message}. ${detailMsg}`;
            }
          }
        }
      } else if (err.message && !err.message.includes('status code')) {
        // Only use err.message if it's not just a status code error
        message = err.message;
      }
      
      // Clean up the message - remove newlines and extra spaces
      message = message.replace(/\n/g, '. ').replace(/\s+/g, ' ').trim();
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  if (submittedLead) {
    return (
      <div style={overlayStyle}>
        <div style={wizardContainerStyle}>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close wizard">
            <X size={20} />
          </button>
          <div style={successHeaderStyle}>
            <CheckCircle size={48} color="#16a34a" />
            <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.75rem', color: '#0f172a' }}>
              Thank you, {submittedLead.fullName.split(' ')[0]}!
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
              Your study abroad loan enquiry has been received. Our education loan expert will reach out to you within
              24 hours to guide you through the next steps.
            </p>
          </div>
          <div style={successCardStyle}>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Email</span>
              <span style={successCardValueStyle}>{submittedLead.email}</span>
            </div>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Preferred Destination</span>
              <span style={successCardValueStyle}>{submittedLead.studyCountry}</span>
            </div>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Loan Requirement</span>
              <span style={successCardValueStyle}>{submittedLead.loanRange}</span>
            </div>
            <div style={successCardRowStyle}>
              <span style={successCardLabelStyle}>Admission Status</span>
              <span style={successCardValueStyle}>
                {admissionStatusOptions.find((option) => option.value === submittedLead.admissionStatus)?.title ||
                  submittedLead.admissionStatus}
              </span>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Meanwhile, feel free to explore resources tailored to your destination and program. You can always come back
            and track your loan journey once we activate your student portal.
          </p>
          <button onClick={onClose} style={primaryButtonStyle}>
            Close & Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  const getStepQuestion = () => {
    switch (currentStep) {
      case 0:
        return 'Where do you plan to study?';
      case 1:
        return 'What is your admission status?';
      case 2:
        return 'When is your intake?';
      case 3:
        return 'Which university do you prefer?';
      case 4:
        return 'What is your loan requirement?';
      case 5:
        return 'Please provide your contact details';
      default:
        return '';
    }
  };

  // Popular countries for grid display (first 6)
  const popularCountriesForGrid = studyCountryOptions.slice(0, 6);

  return (
    <div style={overlayStyle}>
      <div style={wizardContainerStyle}>
        <button onClick={onClose} style={closeButtonStyle} aria-label="Close wizard">
          <X size={20} />
        </button>
        
        {/* Progress Bar with Back Button */}
        <div style={wizardHeaderStyle}>
          {currentStep > 0 && (
            <button onClick={handleBack} style={backButtonStyle} aria-label="Go back">
              <ArrowLeft size={20} color="#22c55e" />
            </button>
          )}
          <div style={progressBarContainerStyle}>
            {stepConfig.map((_, index) => (
              <div
                key={index}
                style={{
                  ...progressSegmentStyle,
                  backgroundColor: index <= currentStep ? '#22c55e' : '#e5e7eb',
                  flex: 1
                }}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <h2 style={questionTitleStyle}>{getStepQuestion()}</h2>

        {error && (
          <div style={errorBannerStyle}>
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div style={wizardBodyStyle}>{renderStepContent()}</div>

        {/* Info Box - Only show for first few steps */}
        {currentStep < 3 && (
          <div style={infoBoxStyle}>
            <Lightbulb size={20} color="#f59e0b" />
            <span>Did you know? We offer upto 50% off on processing fees.</span>
          </div>
        )}

        {/* Footer Actions - Only show Continue for last step */}
        {currentStep === stepConfig.length - 1 && (
          <div style={footerActionsStyle}>
            <button onClick={handleSubmit} style={{ ...primaryButtonStyle, width: '100%' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  function renderStepContent() {
    switch (currentStep) {
      case 0:
        // Popular countries for grid display
        const popularCountriesForGrid = [
          { value: 'United Kingdom (UK)', label: 'United Kingdom (UK)', flag: '🇬🇧' },
          { value: 'United States (USA)', label: 'United States (USA)', flag: '🇺🇸' },
          { value: 'Ireland', label: 'Ireland', flag: '🇮🇪' },
          { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
          { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
          { value: 'Canada', label: 'Canada', flag: '🇨🇦' }
        ];
        
        const displayCountries = countrySearch 
          ? filteredCountries 
          : popularCountriesForGrid;

        return (
          <div>
            {/* Country Grid */}
            <div style={countryGridStyle}>
              {displayCountries.map((country) => {
                const isSelected = formData.studyCountry === country.value;
                return (
                  <button
                    key={country.value}
                    onClick={() => handleSelect('studyCountry', country.value)}
                    style={{
                      ...countryCardStyle,
                      borderColor: isSelected ? '#22c55e' : '#e5e7eb',
                      backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                      boxShadow: isSelected ? '0 4px 12px rgba(8, 145, 178, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{country.flag}</span>
                    <span style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: isSelected ? 600 : 500,
                      color: '#1f2937',
                      textAlign: 'center'
                    }}>
                      {country.label.replace(' (USA)', '').replace(' (UK)', '')}
                    </span>
                    {isSelected && <CheckCircle size={18} color="#22c55e" style={{ position: 'absolute', top: '8px', right: '8px' }} />}
                  </button>
                );
              })}
            </div>
            
            {/* Search Bar */}
            <div style={searchBarContainerStyle}>
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleCountryKeyDown}
                placeholder="Search.."
                style={searchBarStyle}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {isCountryDropdownOpen && (
              <div 
                style={{
                  ...countryDropdownStyle,
                  opacity: dropdownAnimation ? 1 : 0,
                  transform: dropdownAnimation ? 'translateY(0)' : 'translateY(-8px)',
                  transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
                }}
              >
                <div style={countrySearchWrapperStyle}>
                  <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setHighlightedIndex(-1);
                      if (!isCountryDropdownOpen) {
                        setIsCountryDropdownOpen(true);
                      }
                    }}
                    onKeyDown={handleCountryKeyDown}
                    placeholder="Type to search countries..."
                    style={countrySearchInputStyle}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  {countrySearch && (
                    <div style={countrySearchCountStyle}>
                      {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'}
                    </div>
                  )}
                </div>
                
                {!countrySearch && popularCountries.length > 0 && (
                  <div style={popularSectionStyle}>
                    <div style={popularSectionHeaderStyle}>
                      <Globe size={16} color="#64748b" />
                      <span style={popularSectionTitleStyle}>Popular Destinations</span>
                    </div>
                    <div style={popularCountriesGridStyle}>
                      {popularCountries.map((country) => {
                        const active = formData.studyCountry === country.value;
                        return (
                          <button
                            key={country.value}
                            onClick={() => handleSelect('studyCountry', country.value)}
                            onMouseEnter={() => setHighlightedIndex(-1)}
                            style={{
                              ...popularCountryButtonStyle,
                              backgroundColor: active ? '#dcfce7' : '#f8fafc',
                              borderColor: active ? '#22c55e' : '#e2e8f0'
                            }}
                          >
                            <span style={{ fontSize: '1.25rem' }}>{country.flag}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}>
                              {country.label.replace(' (USA)', '').replace(' (UK)', '')}
                            </span>
                            {active && <CheckCircle size={14} color="#22c55e" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={countryDropdownListStyle} ref={countryListRef}>
                  {(() => {
                    const countriesToShow = countrySearch 
                      ? filteredCountries 
                      : studyCountryOptions.filter(c => !popularCountries.some(p => p.value === c.value));
                    const startIndex = countrySearch ? 0 : 0;
                    
                    return countriesToShow.length > 0 ? (
                      countriesToShow.map((country, idx) => {
                        const index = startIndex + idx;
                        const active = formData.studyCountry === country.value;
                        const highlighted = highlightedIndex === index;
                        const isPopular = popularCountries.some(p => p.value === country.value);
                        
                        return (
                          <button
                            key={country.value}
                            onClick={() => handleSelect('studyCountry', country.value)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            style={{
                              ...countryOptionStyle,
                              backgroundColor: active 
                                ? '#dcfce7' 
                                : highlighted 
                                ? '#f1f5f9' 
                                : 'white',
                              borderColor: active ? '#22c55e' : highlighted ? '#cbd5e1' : 'transparent',
                              transform: highlighted ? 'translateX(2px)' : 'translateX(0)',
                              boxShadow: highlighted ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none'
                            }}
                          >
                            <span style={{ fontSize: '1.5rem', marginRight: '0.75rem', minWidth: '28px' }}>
                              {country.flag}
                            </span>
                            <span style={{ flex: 1, textAlign: 'left', fontWeight: active ? 600 : 500, color: '#0f172a' }}>
                              {countrySearch ? highlightMatch(country.label, countrySearch) : country.label}
                            </span>
                            {isPopular && !countrySearch && (
                              <span style={popularBadgeStyle}>Popular</span>
                            )}
                            {active && <CheckCircle size={18} color="#22c55e" style={{ marginLeft: '0.5rem' }} />}
                          </button>
                        );
                      })
                    ) : (
                      <div style={countryNoResultsStyle}>
                        <Globe size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No countries found</p>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          Try searching with a different term
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div style={optionGridStyle}>
            {admissionStatusOptions.map((option) => {
              const active = formData.admissionStatus === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect('admissionStatus', option.value)}
                  style={{
                    ...optionCardStyle,
                    borderColor: active ? '#22c55e' : '#e5e7eb',
                    backgroundColor: active ? '#dcfce7' : '#ffffff',
                    boxShadow: active ? '0 4px 12px rgba(8, 145, 178, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem', fontSize: '1rem' }}>{option.title}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{option.description}</p>
                  </div>
                  {active && <CheckCircle size={20} color="#22c55e" style={{ flexShrink: 0, marginLeft: '1rem' }} />}
                </button>
              );
            })}
          </div>
        );
      case 2:
        return (
          <div style={optionGridStyle}>
            {intakeOptions.map((option) => {
              const active = formData.intake === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect('intake', option)}
                  style={{
                    ...optionCardStyle,
                    borderColor: active ? '#22c55e' : '#e5e7eb',
                    backgroundColor: active ? '#dcfce7' : '#ffffff',
                    boxShadow: active ? '0 4px 12px rgba(8, 145, 178, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Clock size={20} color={active ? '#22c55e' : '#9ca3af'} style={{ marginRight: '0.75rem' }} />
                  <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' }}>{option}</span>
                  {active && <CheckCircle size={18} color="#22c55e" style={{ position: 'absolute', top: '8px', right: '8px' }} />}
                </button>
              );
            })}
          </div>
        );
      case 3:
        return (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                placeholder="Search universities..."
                style={searchInputStyle}
              />
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {filteredUniversities.map((university) => {
                const active = formData.universityPreference === university;
                return (
                  <button
                    key={university}
                    onClick={() => handleSelect('universityPreference', university)}
                    style={{
                      ...listItemStyle,
                      borderColor: active ? '#22c55e' : '#e2e8f0',
                      backgroundColor: active ? '#dcfce7' : 'white'
                    }}
                  >
                    <Building size={18} style={{ marginRight: '0.75rem', color: '#22c55e' }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{university}</span>
                    {active && <CheckCircle size={18} color="#22c55e" />}
                  </button>
                );
              })}
            </div>
          </>
        );
      case 4:
        return (
          <div style={optionGridStyle}>
            {loanRangeOptions.map((option) => {
              const active = formData.loanRange === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect('loanRange', option)}
                  style={{
                    ...optionCardStyle,
                    borderColor: active ? '#22c55e' : '#e5e7eb',
                    backgroundColor: active ? '#dcfce7' : '#ffffff',
                    boxShadow: active ? '0 4px 12px rgba(8, 145, 178, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Shield size={20} color={active ? '#22c55e' : '#9ca3af'} style={{ marginRight: '0.75rem' }} />
                  <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' }}>{option}</span>
                  {active && <CheckCircle size={18} color="#22c55e" style={{ position: 'absolute', top: '8px', right: '8px' }} />}
                </button>
              );
            })}
          </div>
        );
      case 5:
        return (
          <div style={contactFormContainerStyle}>
            <div style={contactFormFieldStyle}>
              <label style={labelStyle}>Full Name*</label>
              <div style={inputWrapperStyle}>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleSelect('fullName', e.target.value)}
                  placeholder="John Smith"
                  style={textInputStyle}
                />
              </div>
            </div>
            <div style={contactFormFieldStyle}>
              <label style={labelStyle}>Email ID*</label>
              <div style={inputWrapperStyle}>
                <Mail size={18} style={inputIconStyle} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleSelect('email', e.target.value)}
                  placeholder="johnsmith@email.com"
                  style={{ ...textInputStyle, paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div style={contactFormRowStyle}>
              <div style={contactFormRowFieldStyle}>
                <label style={labelStyle}>Phone Number*</label>
                <div style={inputWrapperStyle}>
                  <Phone size={18} style={inputIconStyle} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleSelect('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ ...textInputStyle, paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
              <div style={contactFormRowFieldStyle}>
                <label style={labelStyle}>City</label>
                <div style={inputWrapperStyle}>
                  <MapPin size={18} style={inputIconStyle} />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleSelect('city', e.target.value)}
                    placeholder="Permanent city"
                    style={{ ...textInputStyle, paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  zIndex: 2000
};

const wizardContainerStyle = {
  width: '100%',
  maxWidth: '700px',
  minHeight: '70vh',
  maxHeight: '90vh',
  backgroundColor: '#ffffff',
  borderRadius: '1.5rem',
  padding: '2.5rem',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 40px 120px rgba(15, 23, 42, 0.22)'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '2rem',
  right: '2rem',
  border: 'none',
  background: 'rgba(15,23,42,0.06)',
  cursor: 'pointer',
  color: '#0f172a',
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const progressWrapperStyle = {
  height: '6px',
  width: '100%',
  backgroundColor: '#e2e8f0',
  borderRadius: '999px',
  overflow: 'hidden'
};

const progressBarStyle = {
  height: '100%',
  background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
  transition: 'width 0.4s ease'
};

const stepTrackerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '0.5rem',
  marginTop: '1.25rem'
};

const stepTrackerItemStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  padding: '0.6rem 0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease'
};

const stepTrackerBadgeStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '0.65rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '0.9rem'
};

const wizardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '2rem'
};

const backButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.5rem',
  transition: 'background-color 0.2s ease'
};

const progressBarContainerStyle = {
  display: 'flex',
  gap: '0.25rem',
  flex: 1,
  height: '6px'
};

const progressSegmentStyle = {
  height: '100%',
  borderRadius: '3px',
  transition: 'background-color 0.3s ease'
};

const questionTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#1f2937',
  marginBottom: '2rem',
  textAlign: 'center'
};

const wizardBodyStyle = {
  flex: 1,
  marginBottom: '1.5rem',
  overflowY: 'auto',
  paddingRight: '0.5rem',
  minHeight: '300px'
};

const searchInputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  border: '1px solid #cbd5f5',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  outline: 'none',
  backgroundColor: '#f8fafc'
};

const countrySelectInputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  border: '1px solid #cbd5f5',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  outline: 'none',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.2s ease',
  minHeight: '52px'
};

const countryDropdownStyle = {
  position: 'absolute',
  top: 'calc(100% + 0.5rem)',
  left: 0,
  right: 0,
  backgroundColor: '#ffffff',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 20px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.05)',
  zIndex: 1000,
  overflow: 'hidden',
  maxHeight: '400px',
  display: 'flex',
  flexDirection: 'column'
};

const countrySearchWrapperStyle = {
  position: 'relative',
  padding: '0.75rem',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc'
};

const countrySearchInputStyle = {
  width: '100%',
  padding: '0.65rem 1rem 0.65rem 2.75rem',
  border: '1px solid #cbd5f5',
  borderRadius: '0.5rem',
  fontSize: '0.95rem',
  outline: 'none',
  backgroundColor: '#ffffff'
};

const countryDropdownListStyle = {
  maxHeight: '320px',
  overflowY: 'auto',
  padding: '0.5rem'
};

const countryOptionStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid transparent',
  backgroundColor: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '0.25rem',
  transition: 'all 0.15s ease',
  outline: 'none'
};

const countryNoResultsStyle = {
  padding: '2.5rem 1.5rem',
  textAlign: 'center',
  color: '#64748b',
  fontSize: '0.95rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const countrySearchCountStyle = {
  position: 'absolute',
  right: '1.5rem',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '0.75rem',
  color: '#64748b',
  backgroundColor: '#e2e8f0',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  fontWeight: 500
};

const popularSectionStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc'
};

const popularSectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.75rem'
};

const popularSectionTitleStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const popularCountriesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '0.5rem'
};

const popularCountryButtonStyle = {
  padding: '0.65rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.15s ease',
  outline: 'none',
  fontSize: '0.875rem'
};

const popularBadgeStyle = {
  fontSize: '0.7rem',
  fontWeight: 600,
  color: '#22c55e',
  backgroundColor: '#dcfce7',
  padding: '0.15rem 0.5rem',
  borderRadius: '0.25rem',
  marginLeft: 'auto',
  marginRight: '0.5rem'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem'
};

const cardButtonStyle = {
  borderRadius: '1rem',
  border: '1px solid #d6deeb',
  padding: '1rem',
  backgroundColor: '#ffffff',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease'
};

const listItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #d6deeb',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  marginBottom: '0.75rem',
  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)'
};

const errorBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#fee2e2',
  border: '1px solid #fca5a5',
  color: '#b91c1c',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  marginBottom: '1rem'
};

const footerActionsStyle = {
  marginTop: '2rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%'
};

const countryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1rem',
  marginBottom: '1.5rem'
};

const countryCardStyle = {
  borderRadius: '0.75rem',
  border: '2px solid #e5e7eb',
  padding: '1.5rem',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  position: 'relative',
  minHeight: '120px'
};

const searchBarContainerStyle = {
  position: 'relative',
  marginBottom: '1.5rem'
};

const searchBarStyle = {
  width: '100%',
  padding: '0.875rem 1rem 0.875rem 2.75rem',
  border: '1px solid #e5e7eb',
  borderRadius: '0.75rem',
  fontSize: '0.95rem',
  outline: 'none',
  backgroundColor: '#ffffff',
  color: '#1f2937'
};

const optionGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem'
};

const optionCardStyle = {
  borderRadius: '0.75rem',
  border: '2px solid #e5e7eb',
  padding: '1.25rem',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s ease',
  position: 'relative',
  minHeight: '80px'
};

const infoBoxStyle = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fde68a',
  borderRadius: '0.75rem',
  padding: '1rem 1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: '1.5rem',
  color: '#92400e',
  fontSize: '0.95rem'
};

const primaryButtonStyle = {
  backgroundColor: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  padding: '0.9rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 16px 34px rgba(8, 145, 178, 0.25)',
  transition: 'all 0.2s ease'
};

const secondaryButtonStyle = {
  backgroundColor: '#f1f5f9',
  color: '#1f2937',
  border: '1px solid #d0d7e2',
  borderRadius: '0.75rem',
  padding: '0.9rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const labelStyle = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '0.5rem',
  display: 'block'
};

const contactFormContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%'
};

const contactFormFieldStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const contactFormRowFieldStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const contactFormRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  width: '100%',
  alignItems: 'start'
};

const inputWrapperStyle = {
  position: 'relative'
};

const inputIconStyle = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b'
};

const textInputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  fontSize: '1rem',
  backgroundColor: '#f8fafc',
  outline: 'none'
};

const successHeaderStyle = {
  textAlign: 'center',
  marginBottom: '1.75rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const successCardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  padding: '1.25rem',
  marginBottom: '1.5rem',
  display: 'grid',
  gap: '0.75rem',
  backgroundColor: '#f8fafc'
};

const successCardRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem'
};

const successCardLabelStyle = {
  fontSize: '0.875rem',
  color: '#64748b',
  fontWeight: 500
};

const successCardValueStyle = {
  fontSize: '1rem',
  color: '#0f172a',
  fontWeight: 600
};

function Home() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeTopNav, setActiveTopNav] = useState('home'); // 'home' | 'how' | 'about' | 'contact'
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testimonials = [
    {
      name: 'Priya Sharma',
      degree: 'Masters in Computer Science',
      university: 'Stanford University, USA',
      quote: 'The loan process was incredibly smooth and transparent. Thanks to the support, I was able to pursue my dream degree at Stanford without financial stress.'
    },
    {
      name: 'Rahul Patel',
      degree: 'MBA',
      university: 'Harvard Business School, USA',
      quote: 'Getting the education loan was easier than I expected. The team was supportive throughout the entire process.'
    },
    {
      name: 'Sneha Reddy',
      degree: 'MS in Data Science',
      university: 'MIT, USA',
      quote: 'The competitive rates and flexible repayment options made it possible for me to fund my education abroad.'
    },
    {
      name: 'Arjun Mehta',
      degree: 'Masters in Engineering',
      university: 'University of Cambridge, UK',
      quote: 'Quick approval and dedicated support helped me secure my loan in time for the admission deadline.'
    }
  ];

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Track active top navigation based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const threshold = 100;
      const how = document.getElementById('how-it-works');
      const about = document.getElementById('why-choose-us');
      const contact = document.getElementById('contact');
      if (contact && scrollY + threshold >= contact.offsetTop) {
        setActiveTopNav('contact');
        return;
      }
      if (about && scrollY + threshold >= about.offsetTop) {
        setActiveTopNav('about');
        return;
      }
      if (how && scrollY + threshold >= how.offsetTop) {
        setActiveTopNav('how');
        return;
      }
      setActiveTopNav('home');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="top" style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <nav style={topNavStyle}>
        <div style={topNavContainerStyle}>
          <div style={topNavLeftStyle}>
            <GraduationCap size={24} color="#22c55e" />
            <span style={topNavLogoStyle}>Kubera</span>
          </div>
          <div style={topNavMenuStyle}>
            <button
              onClick={() => {
                setActiveTopNav('home');
                const topEl = document.getElementById('top');
                if (topEl) {
                  topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              style={{
                ...topNavMenuItemStyle,
                color: activeTopNav === 'home' ? '#0f172a' : '#64748b',
                fontWeight: activeTopNav === 'home' ? 700 : 500
              }}
            >
              Home
            </button>
            <button
              onClick={() => {
                const section = document.getElementById('how-it-works');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
                setActiveTopNav('how');
              }}
              style={{
                ...topNavMenuItemStyle,
                color: activeTopNav === 'how' ? '#0f172a' : '#64748b',
                fontWeight: activeTopNav === 'how' ? 700 : 500
              }}
            >
              How It Works
            </button>
            <button
              onClick={() => {
                const section = document.getElementById('why-choose-us');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
                setActiveTopNav('about');
              }}
              style={{
                ...topNavMenuItemStyle,
                color: activeTopNav === 'about' ? '#0f172a' : '#64748b',
                fontWeight: activeTopNav === 'about' ? 700 : 500
              }}
            >
              About Us
            </button>
            <button
              onClick={() => {
                const section = document.getElementById('contact');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
                setActiveTopNav('contact');
              }}
              style={{
                ...topNavMenuItemStyle,
                color: activeTopNav === 'contact' ? '#0f172a' : '#64748b',
                fontWeight: activeTopNav === 'contact' ? 700 : 500
              }}
            >
              Contact
            </button>
          </div>
          <div style={topNavRightStyle}>
            <button
              onClick={() => setWizardOpen(true)}
              style={topNavPrimaryButtonStyle}
            >
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={heroSectionStyle}>
        <div style={heroContainerStyle}>
          <div style={heroLeftStyle}>
            <div style={trustBadgeStyle}>
              <TrendingUp size={16} color="#22c55e" style={{ marginRight: '0.5rem' }} />
              Trusted by 50,000+ Students
            </div>
            <h1 style={heroTitleStyle}>
              Fund Your Dreams,<br />
              <span style={{ color: '#22c55e' }}>Study Abroad</span>
            </h1>
            <p style={heroSubtitleStyle}>
              Get education loans from top banks with competitive rates. Apply and secure funding in just 48 hours. Your global education journey starts here.
            </p>
            <div style={heroFeaturesStyle}>
              <div style={heroFeatureCardStyle}>
                <GraduationCap size={24} color="#22c55e" />
                <div>
                  <div style={heroFeatureTitleStyle}>Up to ₹1 Cr Loan</div>
                </div>
              </div>
              <div style={heroFeatureCardStyle}>
                <Shield size={24} color="#22c55e" />
                <div>
                  <div style={heroFeatureTitleStyle}>100% Secure Process</div>
                </div>
              </div>
              <div style={heroFeatureCardStyle}>
                <TrendingUp size={24} color="#22c55e" />
                <div>
                  <div style={heroFeatureTitleStyle}>Lowest Interest Rates</div>
                </div>
              </div>
            </div>
            <div style={heroButtonsStyle}>
              <button
                onClick={() => setWizardOpen(true)}
                style={heroPrimaryButtonStyle}
              >
                Check Eligibility Now
              </button>
              <button
                onClick={() => {
                  const section = document.getElementById('loan-options');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={heroSecondaryButtonStyle}
              >
                View Loan Options
              </button>
            </div>
          </div>
          <div style={heroRightStyle}>
            <div style={heroGraphicStyle}>
              <GraduationCap size={200} color="#86efac" strokeWidth={0.5} style={{ opacity: 0.4 }} />
              <div style={heroBadgeTopStyle}>
                <div style={heroBadgeNumberStyle}>98%</div>
                <div style={heroBadgeLabelStyle}>Approval Rate</div>
              </div>
              <div style={heroBadgeBottomStyle}>
                <div style={heroBadgeNumberStyle}>48hrs</div>
                <div style={heroBadgeLabelStyle}>Quick Approval</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Key Statistics Section */}
      <section style={statsSectionStyle}>
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <Users size={40} color="#22c55e" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
            <div style={statNumberStyle}>64,800+</div>
            <div style={statLabelStyle}>Students Funded</div>
          </div>
          <div style={statCardStyle}>
            <GraduationCap size={40} color="#22c55e" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
            <div style={statNumberStyle}>1,700+</div>
            <div style={statLabelStyle}>Institutes</div>
          </div>
          <div style={statCardStyle}>
            <Globe size={40} color="#22c55e" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
            <div style={statNumberStyle}>51</div>
            <div style={statLabelStyle}>Countries</div>
          </div>
        </div>
      </section>

      {/* Loan Options Section */}
      <section id="loan-options" style={loanOptionsSectionStyle}>
        <h2 style={sectionTitleStyle}>Choose Your Loan Option</h2>
        <p style={sectionSubtitleStyle}>Select the best option that suits your financial needs</p>
        <div style={loanOptionsGridStyle}>
          <div style={loanCardStyle}>
            <Users size={32} color="#9333ea" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
            <h3 style={loanCardTitleStyle}>US Cosigner</h3>
            <p style={loanCardDescriptionStyle}>
              Get a loan with the help of a US-based cosigner who has good credit history.
            </p>
            <ul style={loanCardListStyle}>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Lower interest rates</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Higher loan amounts</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Faster approval process</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Build US credit history</li>
            </ul>
            <button style={enquireButtonStyle} onClick={() => setWizardOpen(true)}>
              Enquire Now
            </button>
          </div>
          <div style={loanCardStyle}>
            <Users size={32} color="#9333ea" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
            <h3 style={loanCardTitleStyle}>No Cosigner</h3>
            <p style={loanCardDescriptionStyle}>
              Apply for a loan without requiring a cosigner. Perfect for independent students.
            </p>
            <ul style={loanCardListStyle}>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>No credit history required</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Flexible repayment options</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Quick application process</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>No additional guarantor needed</li>
            </ul>
            <button style={enquireButtonStyle} onClick={() => setWizardOpen(true)}>
              Enquire Now
            </button>
          </div>
          <div style={loanCardStyle}>
            <Flag size={32} color="#9333ea" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
            <h3 style={loanCardTitleStyle}>Indian Cosigner</h3>
            <p style={loanCardDescriptionStyle}>
              Secure your education loan with an Indian cosigner, making it easier for students.
            </p>
            <ul style={loanCardListStyle}>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Competitive interest rates</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Simplified documentation</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Local support available</li>
              <li style={loanCardListItemStyle}><span style={greenDotStyle}>•</span>Collateral options available</li>
            </ul>
            <button style={enquireButtonStyle} onClick={() => setWizardOpen(true)}>
              Enquire Now
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={howItWorksSectionStyle}>
        <h2 style={howItWorksTitleSectionStyle}>HOW IT WORKS</h2>
        <p style={howItWorksSubtitleSectionStyle}>Take advantage of our 100% digital process in just 5 easy steps</p>
        <div style={howItWorksStepsContainerStyle}>
          <div style={howItWorksStepCardStyle}>
            <div style={howItWorksStepIconWrapperStyle}>
              <div style={howItWorksStepIconInnerStyle}>
                <DollarSign size={32} color="#22c55e" />
                <CheckCircle size={20} color="#ffffff" style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
              </div>
            </div>
            <h3 style={howItWorksStepTitleStyle}>Check Loan Eligibility</h3>
            <p style={howItWorksStepTextStyle}>
              Quickly verify your <span style={{ color: '#22c55e', fontWeight: 600 }}>loan eligibility</span> online by following quick, easy steps!
            </p>
            <div style={howItWorksStepConnectorStyle}>
              <ArrowRight size={24} color="#cbd5e1" />
            </div>
          </div>
          <div style={howItWorksStepCardStyle}>
            <div style={howItWorksStepIconWrapperStyle}>
              <div style={howItWorksStepIconInnerStyle}>
                <Users size={32} color="#22c55e" />
              </div>
            </div>
            <h3 style={howItWorksStepTitleStyle}>Talk to Our Loan Experts</h3>
            <p style={howItWorksStepTextStyle}>
              Speak with our loan specialists for <span style={{ color: '#22c55e', fontWeight: 600 }}>tailored guidance</span>, all from the comfort of your home.
            </p>
            <div style={howItWorksStepConnectorStyle}>
              <ArrowRight size={24} color="#cbd5e1" />
            </div>
          </div>
          <div style={howItWorksStepCardStyle}>
            <div style={howItWorksStepIconWrapperStyle}>
              <div style={howItWorksStepIconInnerStyle}>
                <Building size={32} color="#22c55e" />
                <CheckCircle size={20} color="#ffffff" style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
              </div>
            </div>
            <h3 style={howItWorksStepTitleStyle}>Submit Documents & Get Verified</h3>
            <p style={howItWorksStepTextStyle}>
              Seamlessly <span style={{ color: '#22c55e', fontWeight: 600 }}>upload documents</span> and fill out digital forms for swift bank verification.
            </p>
            <div style={howItWorksStepConnectorStyle}>
              <ArrowRight size={24} color="#cbd5e1" />
            </div>
          </div>
          <div style={howItWorksStepCardStyle}>
            <div style={howItWorksStepIconWrapperStyle}>
              <div style={howItWorksStepIconInnerStyle}>
                <TrendingUp size={32} color="#22c55e" />
                <CheckCircle size={20} color="#ffffff" style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
              </div>
            </div>
            <h3 style={howItWorksStepTitleStyle}>Unlock the Best Interest Rates</h3>
            <p style={howItWorksStepTextStyle}>
              Kubera experts <span style={{ color: '#22c55e', fontWeight: 600 }}>negotiate competitive rates</span> for you.
            </p>
            <div style={howItWorksStepConnectorStyle}>
              <ArrowRight size={24} color="#cbd5e1" />
            </div>
          </div>
          <div style={howItWorksStepCardStyle}>
            <div style={howItWorksStepIconWrapperStyle}>
              <div style={howItWorksStepIconInnerStyle}>
                <CheckCircle size={32} color="#22c55e" />
                <CheckCircle size={20} color="#ffffff" style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
              </div>
            </div>
            <h3 style={howItWorksStepTitleStyle}>Loan Approval & Sanction in 48 Hours*</h3>
            <p style={howItWorksStepTextStyle}>
              Get <span style={{ color: '#22c55e', fontWeight: 600 }}>rapid fund disbursement</span> due to quick sanctions.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" style={whyChooseUsSectionStyle}>
        <h2 style={sectionTitleStyle}>Why Choose Us</h2>
        <p style={sectionSubtitleStyle}>Trusted by thousands of students for their education financing needs</p>
        <div style={whyChooseUsGridStyle}>
          <div style={whyChooseUsCardStyle}>
            <div style={whyChooseUsIconWrapperStyle}>
              <DollarSign size={40} color="#22c55e" strokeWidth={1.5} />
            </div>
            <h3 style={whyChooseUsTitleStyle}>Up to ₹1 Cr Loan</h3>
            <p style={whyChooseUsTextStyle}>Get loan amounts up to ₹1 crore to cover tuition fees, living expenses, and other costs.</p>
          </div>
          <div style={whyChooseUsCardStyle}>
            <div style={whyChooseUsIconWrapperStyle}>
              <Shield size={40} color="#22c55e" strokeWidth={1.5} />
            </div>
            <h3 style={whyChooseUsTitleStyle}>100% Secure Process</h3>
            <p style={whyChooseUsTextStyle}>Your data is encrypted and secure. We follow industry-standard security protocols.</p>
          </div>
          <div style={whyChooseUsCardStyle}>
            <div style={whyChooseUsIconWrapperStyle}>
              <TrendingUp size={40} color="#22c55e" strokeWidth={1.5} />
            </div>
            <h3 style={whyChooseUsTitleStyle}>Lowest Interest Rates</h3>
            <p style={whyChooseUsTextStyle}>Get the best interest rates from top lenders in the market.</p>
          </div>
          <div style={whyChooseUsCardStyle}>
            <div style={whyChooseUsIconWrapperStyle}>
              <Clock size={40} color="#22c55e" strokeWidth={1.5} />
            </div>
            <h3 style={whyChooseUsTitleStyle}>Quick Approval</h3>
            <p style={whyChooseUsTextStyle}>Fast-track approval process with minimal documentation. Get funds in 48 hours.</p>
          </div>
          <div style={whyChooseUsCardStyle}>
            <div style={whyChooseUsIconWrapperStyle}>
              <Globe size={40} color="#22c55e" strokeWidth={1.5} />
            </div>
            <h3 style={whyChooseUsTitleStyle}>Global Coverage</h3>
            <p style={whyChooseUsTextStyle}>Study loans for 50+ countries including USA, UK, Canada, Australia, and more.</p>
          </div>
          <div style={whyChooseUsCardStyle}>
            <div style={whyChooseUsIconWrapperStyle}>
              <Users size={40} color="#22c55e" strokeWidth={1.5} />
            </div>
            <h3 style={whyChooseUsTitleStyle}>Expert Support</h3>
            <p style={whyChooseUsTextStyle}>Get dedicated support from our team of education loan experts throughout the process.</p>
          </div>
        </div>
      </section>

      {/* Student Success Stories Section */}
      <section id="testimonials" style={testimonialsSectionStyle}>
        <h2 style={sectionTitleStyle}>Student Success Stories</h2>
        <p style={sectionSubtitleStyle}>Hear from students who achieved their dreams with our support</p>
        <div style={testimonialCardWrapperStyle}>
          <button 
            style={testimonialNavButtonStyle} 
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ArrowLeft size={24} color="#94a3b8" />
          </button>
          <div style={testimonialCardStyle}>
            <div style={quoteIconStyle}>"</div>
            <p style={testimonialQuoteStyle}>
              {testimonials[testimonialIndex].quote}
            </p>
            <div style={testimonialAuthorStyle}>
              <div style={testimonialNameStyle}>{testimonials[testimonialIndex].name}</div>
              <div style={testimonialDegreeStyle}>{testimonials[testimonialIndex].degree}</div>
              <div style={testimonialUniversityStyle}>{testimonials[testimonialIndex].university}</div>
            </div>
          </div>
          <button 
            style={testimonialNavButtonStyle} 
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ArrowRight size={24} color="#94a3b8" />
          </button>
        </div>
        <div style={testimonialDotsStyle}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              style={{
                ...testimonialDotStyle,
                backgroundColor: index === testimonialIndex ? '#22c55e' : '#cbd5e1',
                width: index === testimonialIndex ? '12px' : '8px',
                height: index === testimonialIndex ? '12px' : '8px'
              }}
              onClick={() => setTestimonialIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Ready to Fund Section */}
      <section id="ready-to-fund" style={readyToFundSectionStyle}>
        <div style={readyToFundContentStyle}>
          <h2 style={readyToFundTitleStyle}>Ready to Fund Your Education?</h2>
          <p style={readyToFundSubtitleStyle}>
            Start your journey today. Check your eligibility and get instant loan offers from top lenders.
          </p>
          <div style={readyToFundButtonsStyle}>
            <button
              onClick={() => setWizardOpen(true)}
              style={readyToFundPrimaryButtonStyle}
            >
              Check Eligibility Now
            </button>
            <button
              onClick={() => {
                const section = document.getElementById('loan-options');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={readyToFundSecondaryButtonStyle}
            >
              View Loan Options
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={footerStyle}>
        <div style={footerContentStyle}>
          <div style={footerSectionStyle}>
            <div style={footerLogoStyle}>
              <GraduationCap size={24} color="#22c55e" />
              <span style={footerLogoTextStyle}>Kubera</span>
            </div>
            <p style={footerTextStyle}>
              Empowering students to achieve their dreams of studying abroad with flexible and affordable education loans.
            </p>
          </div>
          <div style={footerSectionStyle}>
            <h4 style={footerHeadingStyle}>Quick Links</h4>
            <ul style={footerListStyle}>
              <li><a href="#loan-options" style={footerLinkStyle}>Loan Options</a></li>
              <li><a href="#how-it-works" style={footerLinkStyle}>How It Works</a></li>
              <li><a href="#why-choose-us" style={footerLinkStyle}>About Us</a></li>
              <li><a href="#testimonials" style={footerLinkStyle}>Success Stories</a></li>
            </ul>
          </div>
          <div style={footerSectionStyle}>
            <h4 style={footerHeadingStyle}>Contact</h4>
            <ul style={footerListStyle}>
              <li style={footerContactItemStyle}>
                <Phone size={16} color="#64748b" style={{ marginRight: '0.5rem' }} />
                +91 1800-123-4567
              </li>
              <li style={footerContactItemStyle}>
                <Mail size={16} color="#64748b" style={{ marginRight: '0.5rem' }} />
                support@kubera.com
              </li>
              <li style={footerContactItemStyle}>
                <MapPin size={16} color="#64748b" style={{ marginRight: '0.5rem' }} />
                Mumbai, India
              </li>
            </ul>
          </div>
        </div>
        <div style={footerBottomStyle}>
          <p style={footerCopyrightStyle}>© {new Date().getFullYear()} Kubera. All rights reserved.</p>
          <div style={footerSocialStyle}>
            <span style={footerSocialTextStyle}>Follow us:</span>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={footerSocialLinkStyle}>Instagram</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" style={footerSocialLinkStyle}>LinkedIn</a>
          </div>
        </div>
      </footer>

      <EligibilityWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}

// Hero Section Styles
const heroSectionStyle = {
  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #a7f3d0 100%)',
  padding: '4rem 6vw 5rem',
  minHeight: '600px',
  display: 'flex',
  alignItems: 'center'
};

const heroContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '4rem',
  alignItems: 'center',
  width: '100%'
};

const heroLeftStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const trustBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.5rem 1rem',
  backgroundColor: '#22c55e',
  color: 'white',
  borderRadius: '999px',
  fontSize: '0.875rem',
  fontWeight: 600,
  width: 'fit-content',
  marginBottom: '0.5rem'
};

const heroTitleStyle = {
  fontSize: '3.5rem',
  fontWeight: 700,
  lineHeight: 1.2,
  color: '#0f172a',
  marginBottom: '0.5rem'
};

const heroSubtitleStyle = {
  fontSize: '1.125rem',
  lineHeight: 1.7,
  color: '#475569',
  marginBottom: '1rem'
};

const heroFeaturesStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  flexWrap: 'wrap'
};

const heroFeatureCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  backgroundColor: 'white',
  padding: '1rem 1.25rem',
  borderRadius: '0.75rem',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e5e7eb'
};

const heroFeatureTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#0f172a'
};

const heroButtonsStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
  flexWrap: 'wrap'
};

const heroPrimaryButtonStyle = {
  padding: '0.875rem 2rem',
  backgroundColor: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
};

const heroSecondaryButtonStyle = {
  padding: '0.875rem 2rem',
  backgroundColor: 'white',
  color: '#0f172a',
  border: '2px solid #e5e7eb',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const heroRightStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
};

const heroGraphicStyle = {
  width: '100%',
  maxWidth: '500px',
  height: '500px',
  backgroundColor: '#a7f3d0',
  borderRadius: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxShadow: '0 8px 32px rgba(167, 243, 208, 0.4)'
};

const heroBadgeTopStyle = {
  position: 'absolute',
  top: '2rem',
  right: '2rem',
  backgroundColor: 'white',
  padding: '1rem 1.5rem',
  borderRadius: '0.75rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  textAlign: 'center'
};

const heroBadgeBottomStyle = {
  position: 'absolute',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  padding: '1rem 1.5rem',
  borderRadius: '0.75rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  textAlign: 'center'
};

const heroBadgeNumberStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: '#22c55e',
  marginBottom: '0.25rem'
};

const heroBadgeLabelStyle = {
  fontSize: '0.875rem',
  color: '#64748b',
  fontWeight: 500
};

// Stats Section Styles
const statsSectionStyle = {
  padding: '3rem 6vw',
  backgroundColor: '#ffffff'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '2rem',
  maxWidth: '1200px',
  margin: '0 auto'
};

const statCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  padding: '2.5rem',
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e5e7eb'
};

const statNumberStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#22c55e',
  marginBottom: '0.5rem'
};

const statLabelStyle = {
  fontSize: '1rem',
  color: '#64748b',
  fontWeight: 500
};

// Loan Options Section Styles
const loanOptionsSectionStyle = {
  padding: '4rem 6vw',
  backgroundColor: '#f8fafc'
};

const sectionTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#0f172a',
  textAlign: 'center',
  marginBottom: '1rem'
};

const sectionSubtitleStyle = {
  fontSize: '1.1rem',
  color: '#64748b',
  textAlign: 'center',
  marginBottom: '3rem'
};

const loanOptionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem',
  maxWidth: '1200px',
  margin: '0 auto'
};

const loanCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  padding: '2rem',
  border: '2px solid #9333ea',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  display: 'flex',
  flexDirection: 'column'
};

const loanCardTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '1rem'
};

const loanCardDescriptionStyle = {
  fontSize: '1rem',
  color: '#475569',
  lineHeight: 1.6,
  marginBottom: '1.5rem'
};

const loanCardListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 2rem 0',
  flex: 1
};

const loanCardListItemStyle = {
  padding: '0.5rem 0',
  fontSize: '0.95rem',
  color: '#475569',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5rem'
};

const greenDotStyle = {
  color: '#22c55e',
  fontSize: '1.2rem',
  lineHeight: 1,
  flexShrink: 0
};

// Adding list item styles with green dot
const enquireButtonStyle = {
  backgroundColor: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  padding: '0.875rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '100%',
  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.25)'
};

// Testimonials Section Styles
const testimonialsSectionStyle = {
  padding: '4rem 6vw',
  backgroundColor: '#ffffff'
};

const testimonialCardWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  maxWidth: '900px',
  margin: '0 auto 2rem',
  position: 'relative'
};

const testimonialNavButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  transition: 'color 0.2s ease'
};

const testimonialCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1.5rem',
  padding: '3rem',
  flex: 1,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  position: 'relative',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const quoteIconStyle = {
  fontSize: '5rem',
  color: '#22c55e',
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: '1rem',
  fontFamily: 'Georgia, serif'
};

const testimonialQuoteStyle = {
  fontSize: '1.25rem',
  color: '#475569',
  lineHeight: 1.7,
  marginBottom: '2rem',
  fontStyle: 'italic'
};

const testimonialAuthorStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const testimonialNameStyle = {
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '0.25rem'
};

const testimonialDegreeStyle = {
  fontSize: '1rem',
  color: '#22c55e',
  fontWeight: 600,
  marginBottom: '0.25rem'
};

const testimonialUniversityStyle = {
  fontSize: '0.95rem',
  color: '#64748b'
};

const testimonialDotsStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: '2rem'
};

const testimonialDotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  padding: 0
};

// Top Navigation Styles
const topNavStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

const topNavContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '1rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2rem'
};

const topNavLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem'
};

const topNavLogoStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#1f2937',
  letterSpacing: '-0.02em'
};

const topNavMenuStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  justifyContent: 'flex-end',
  marginRight: '1rem'
};

const topNavMenuItemStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '0.5rem',
  transition: 'all 0.2s ease'
};

const topNavRightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const topNavButtonStyle = {
  padding: '0.5rem 1.25rem',
  backgroundColor: 'transparent',
  border: '1px solid #e2e8f0',
  color: '#64748b',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '0.5rem',
  transition: 'all 0.2s ease'
};

const topNavPrimaryButtonStyle = {
  padding: '0.5rem 1.25rem',
  backgroundColor: '#22c55e',
  border: 'none',
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: '0.5rem',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
};

// How It Works Section Styles
const howItWorksSectionStyle = {
  padding: '4rem 6vw',
  backgroundColor: '#ffffff'
};

const howItWorksTitleSectionStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#0f172a',
  textAlign: 'center',
  marginBottom: '1rem',
  letterSpacing: '0.05em'
};

const howItWorksSubtitleSectionStyle = {
  fontSize: '1.125rem',
  color: '#64748b',
  textAlign: 'center',
  marginBottom: '3rem',
  maxWidth: '800px',
  margin: '0 auto 3rem'
};

const howItWorksStepsContainerStyle = {
  display: 'flex',
  gap: '1.5rem',
  maxWidth: '1400px',
  margin: '0 auto',
  overflowX: 'auto',
  padding: '1rem 0'
};

const howItWorksStepCardStyle = {
  minWidth: '280px',
  flex: 1,
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  padding: '2rem',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const howItWorksStepIconWrapperStyle = {
  marginBottom: '1rem'
};

const howItWorksStepIconInnerStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '1rem',
  backgroundColor: '#dcfce7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
};

const howItWorksStepTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '0.5rem'
};

const howItWorksStepTextStyle = {
  fontSize: '0.95rem',
  color: '#64748b',
  lineHeight: 1.6,
  flex: 1
};

const howItWorksStepConnectorStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 'auto',
  paddingTop: '1rem'
};

// Why Choose Us Section Styles
const whyChooseUsSectionStyle = {
  padding: '4rem 6vw',
  backgroundColor: '#f8fafc'
};

const whyChooseUsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem',
  maxWidth: '1200px',
  margin: '2rem auto 0'
};

const whyChooseUsCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  padding: '2rem',
  textAlign: 'center',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease'
};

const whyChooseUsIconWrapperStyle = {
  width: '5rem',
  height: '5rem',
  borderRadius: '1rem',
  backgroundColor: '#dcfce7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1.5rem'
};

const whyChooseUsTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '0.75rem'
};

const whyChooseUsTextStyle = {
  fontSize: '0.95rem',
  color: '#64748b',
  lineHeight: 1.6
};

// Ready to Fund Section Styles
const readyToFundSectionStyle = {
  padding: '4rem 6vw',
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
  color: 'white',
  textAlign: 'center'
};

const readyToFundContentStyle = {
  maxWidth: '800px',
  margin: '0 auto'
};

const readyToFundTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: '1rem',
  color: 'white'
};

const readyToFundSubtitleStyle = {
  fontSize: '1.1rem',
  marginBottom: '2rem',
  opacity: 0.95,
  lineHeight: 1.6,
  color: 'white'
};

const readyToFundButtonsStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  flexWrap: 'wrap'
};

const readyToFundPrimaryButtonStyle = {
  padding: '0.875rem 2rem',
  backgroundColor: 'white',
  color: '#22c55e',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
};

const readyToFundSecondaryButtonStyle = {
  padding: '0.875rem 2rem',
  backgroundColor: 'transparent',
  color: 'white',
  border: '2px solid white',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

// Footer Styles
const footerStyle = {
  backgroundColor: '#1f2937',
  color: '#9ca3af',
  padding: '3rem 6vw 1.5rem'
};

const footerContentStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '2rem',
  marginBottom: '2rem'
};

const footerSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const footerLogoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1rem'
};

const footerLogoTextStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'white'
};

const footerTextStyle = {
  fontSize: '0.95rem',
  lineHeight: 1.6,
  color: '#9ca3af'
};

const footerHeadingStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: 'white',
  marginBottom: '0.5rem'
};

const footerListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const footerLinkStyle = {
  color: '#9ca3af',
  textDecoration: 'none',
  fontSize: '0.95rem',
  transition: 'color 0.2s ease'
};

const footerContactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.95rem',
  color: '#9ca3af'
};

const footerBottomStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  paddingTop: '2rem',
  borderTop: '1px solid #374151',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem'
};

const footerCopyrightStyle = {
  fontSize: '0.875rem',
  color: '#9ca3af'
};

const footerSocialStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap'
};

const footerSocialTextStyle = {
  fontSize: '0.875rem',
  color: '#9ca3af'
};

const footerSocialLinkStyle = {
  fontSize: '0.875rem',
  color: '#9ca3af',
  textDecoration: 'none',
  transition: 'color 0.2s ease'
};

export default Home;