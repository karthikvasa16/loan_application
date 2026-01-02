import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, AlertCircle, User, Users, Building2, FileCheck, Home, MapPin, Upload, FileText, X, Eye, Save, RefreshCw, GraduationCap, CreditCard, Globe, Menu, Settings, LogOut, FileBarChart, DollarSign, Camera,
  Calendar, Phone, Mail, Building, Briefcase, TrendingUp, Activity, ArrowRight, Clock
} from 'lucide-react';
import './StudentDashboard.css';
import loanApplicationAPI from '../services/loanApplicationAPI';
import { useAuth } from '../contexts/AuthContext';

const applicationSteps = [
  { id: 'basic_info', step: '01', title: 'Basic Information', description: 'Identity & Loan Requirements', completed: false },
  { id: 'personal_details', step: '02', title: 'Additional Details', description: 'Birth & Demographics', completed: false },
  { id: 'academic', step: '03', title: 'Academic Details', description: 'Education information', completed: false },
  { id: 'financial', step: '04', title: 'Financial Details', description: 'Income & expenses', completed: false },
  { id: 'family', step: '05', title: 'Family Details', description: 'Parent/Guardian info', completed: false },
  { id: 'address', step: '06', title: 'Address Details', description: 'Current & permanent', completed: false },
  { id: 'documents', step: '07', title: 'Documents', description: 'Upload required docs', completed: false },
  { id: 'preview', step: '08', title: 'Review', description: 'Verify & submit', completed: false }
];

function StudentDocumentsUpload() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('basic_info');
  const [formData, setFormData] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('loan-application');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout, updateProfilePicture } = useAuth();
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);

  // Helper to map backend flat structure to frontend nested structure
  const unflattenData = useCallback((flatData) => {
    return {
      type: {
        loanType: flatData.loanType,
        loanAmount: flatData.loanAmount,
        tenure: flatData.tenure
      },
      applicant: {
        firstName: flatData.firstName,
        lastName: flatData.lastName,
        dateOfBirth: flatData.dateOfBirth,
        gender: flatData.gender,
        email: flatData.email,
        phone: flatData.phone,
        nationality: flatData.nationality,
        maritalStatus: flatData.maritalStatus
      },
      academic: {
        currentQualification: flatData.currentQualification,
        currentInstitution: flatData.currentInstitution,
        percentage: flatData.percentage,
        yearOfPassing: flatData.yearOfPassing,
        targetCountry: flatData.targetCountry,
        targetUniversity: flatData.targetUniversity,
        courseLevel: flatData.courseLevel,
        courseName: flatData.courseName,
        courseDuration: flatData.courseDuration,
        intakeSession: flatData.intakeSession,
        tuitionFee: flatData.tuitionFee
      },
      financial: {
        employmentStatus: flatData.employmentStatus,
        annualIncome: flatData.annualIncome,
        employerName: flatData.employerName,
        workExperience: flatData.workExperience,
        existingEMI: flatData.existingEMI,
        creditCardOutstanding: flatData.creditCardOutstanding,
        bankBalance: flatData.bankBalance,
        investments: flatData.investments,
        propertyOwned: flatData.propertyOwned ? 'Yes' : 'No',
        propertyValue: flatData.propertyValue
      },
      family: {
        fatherName: flatData.fatherName,
        motherName: flatData.motherName,
        fatherOccupation: flatData.fatherOccupation,
        motherOccupation: flatData.motherOccupation,
        fatherIncome: flatData.fatherIncome,
        motherIncome: flatData.motherIncome,
        fatherPhone: flatData.fatherPhone,
        motherPhone: flatData.motherPhone,
        dependents: flatData.dependents,
        coApplicantRequired: flatData.coApplicantRequired,
        coApplicantName: flatData.coApplicantName,
        coApplicantRelation: flatData.coApplicantRelation
      },
      address: {
        currentAddress: flatData.currentAddress,
        city: flatData.city,
        state: flatData.state,
        pincode: flatData.pincode,
        country: flatData.country,
        residenceType: flatData.residenceType,
        sameAddress: flatData.sameAddress,
        permanentAddress: flatData.permanentAddress,
        permanentCity: flatData.permanentCity,
        permanentState: flatData.permanentState,
        permanentPincode: flatData.permanentPincode,
        permanentCountry: flatData.permanentCountry
      },
      preview: {
        termsAccepted: flatData.termsAccepted
      }
    };
  }, []);

  useEffect(() => {
    const loadApplication = async () => {
      let loadedFromBackend = false;

      if (user?.email) {
        try {
          // Check for existing partial (draft) applications
          const response = await loanApplicationAPI.getApplications({
            email: user.email,
            status: 'draft'
          });

          if (response.success && response.data && response.data.length > 0) {
            const latestDraft = response.data[0];
            const fullAppResponse = await loanApplicationAPI.getApplication(latestDraft.id);

            if (fullAppResponse.success) {
              const { application, documents } = fullAppResponse.data;
              const mappedData = unflattenData(application);

              // Clean up null/undefined values
              Object.keys(mappedData).forEach(section => {
                Object.keys(mappedData[section]).forEach(key => {
                  if (mappedData[section][key] === null || mappedData[section][key] === undefined) {
                    delete mappedData[section][key];
                  }
                });
              });

              setFormData(mappedData);
              setApplicationId(application.id);

              // Map documents
              const docsMap = {};
              if (documents) {
                documents.forEach(doc => {
                  docsMap[doc.documentType] = {
                    name: doc.originalName,
                    size: doc.fileSize,
                    type: 'application/pdf', // default
                    uploaded: true
                  };
                });
                setUploadedDocs(docsMap);
              }

              loadedFromBackend = true;
              console.log('Loaded draft from backend:', application.id);
            }
          }
        } catch (error) {
          console.error('Error fetching backend draft:', error);
        }
      }

      if (!loadedFromBackend) {
        const savedData = localStorage.getItem('kubera_loan_application');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setFormData(parsed.formData || {});
            setUploadedDocs(parsed.uploadedDocs || {});
            setApplicationId(parsed.applicationId || null);
          } catch (error) {
            console.error('Error loading saved data:', error);
          }
        }
      }
    };

    loadApplication();
  }, [user, unflattenData]);

  useEffect(() => {
    const dataToSave = { formData, uploadedDocs, applicationId };
    localStorage.setItem('kubera_loan_application', JSON.stringify(dataToSave));
  }, [formData, uploadedDocs, applicationId]);



  const validateStep = useCallback((stepId) => {
    const stepErrors = {};

    switch (stepId) {
      case 'basic_info':
        // Personal validations
        if (!formData.applicant?.firstName) stepErrors.firstName = 'First name is required';
        if (!formData.applicant?.lastName) stepErrors.lastName = 'Last name is required';
        if (!formData.applicant?.email) stepErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicant.email)) stepErrors.email = 'Invalid email format';
        if (!formData.applicant?.phone) stepErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.applicant.phone)) stepErrors.phone = 'Invalid phone number (10 digits)';

        // Loan validations
        if (!formData.type?.loanType) stepErrors.loanType = 'Please select loan type';
        if (!formData.type?.loanAmount) stepErrors.loanAmount = 'Please enter loan amount';
        break;

      case 'personal_details':
        if (!formData.applicant?.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.applicant?.gender) stepErrors.gender = 'Gender is required';
        // Removed nationality and maritalStatus mandatory checks as they might not be filled yet
        break;
      case 'academic':
        if (!formData.academic?.currentQualification) stepErrors.currentQualification = 'Current qualification is required';
        if (!formData.academic?.targetCountry) stepErrors.targetCountry = 'Target country is required';
        if (!formData.academic?.targetUniversity) stepErrors.targetUniversity = 'Target university is required';
        if (!formData.academic?.courseLevel) stepErrors.courseLevel = 'Course level is required';
        break;
      case 'financial':
        if (!formData.financial?.annualIncome) stepErrors.annualIncome = 'Annual income is required';
        if (!formData.financial?.employmentStatus) stepErrors.employmentStatus = 'Employment status is required';
        break;
      case 'family':
        if (!formData.family?.fatherName) stepErrors.fatherName = 'Father name is required';
        if (!formData.family?.motherName) stepErrors.motherName = 'Mother name is required';
        break;
      case 'address':
        if (!formData.address?.currentAddress) stepErrors.currentAddress = 'Current address is required';
        if (!formData.address?.city) stepErrors.city = 'City is required';
        if (!formData.address?.state) stepErrors.state = 'State is required';
        if (!formData.address?.pincode) stepErrors.pincode = 'PIN code is required';
        break;
      case 'documents':
        // Make document validation less strict for initial testing if needed, or keep strict
        const requiredDocTypes = ['photo', 'identity', 'address', 'income', 'academic', 'bank'];
        const missingDocs = requiredDocTypes.filter(docType => !uploadedDocs[docType]);
        if (missingDocs.length > 0) {
          stepErrors.documents = `Please upload: ${missingDocs.join(', ')}`;
        }
        break;
      case 'preview':
        if (!formData.preview?.termsAccepted) stepErrors.termsAccepted = 'Please accept terms and conditions';
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [stepId]: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [formData, uploadedDocs]);

  const validateAllSteps = useCallback(() => {
    let isValid = true;
    const firstInvalidStep = applicationSteps.find(step => {
      const stepValid = validateStep(step.id);
      if (!stepValid) isValid = false;
      return !stepValid;
    });

    if (firstInvalidStep) {
      setCurrentStep(firstInvalidStep.id);
      // alert(`Please complete the ${firstInvalidStep.title} step before submitting.`);
    }

    return isValid;
  }, [validateStep]);

  const updateFormData = useCallback((stepId, data) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data }
    }));
  }, []);

  const saveToBackend = useCallback(async () => {
    // Check if we have enough data to save
    const hasRequiredData = formData.type?.loanType &&
      formData.applicant?.firstName &&
      formData.applicant?.lastName &&
      formData.applicant?.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicant?.email) &&
      formData.applicant?.phone;

    if (!hasRequiredData) {
      alert('Please fill in loan type, personal details with valid email, and phone before saving.');
      return;
    }

    try {
      if (applicationId) {
        await loanApplicationAPI.saveDraft(applicationId, formData);
      } else {
        const response = await loanApplicationAPI.createApplication(formData);
        setApplicationId(response.data.id);
      }
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save draft. Please try again.');
    }
  }, [formData, applicationId]);



  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      const currentIndex = applicationSteps.findIndex(step => step.id === currentStep);
      if (currentIndex < applicationSteps.length - 1) {
        setCurrentStep(applicationSteps[currentIndex + 1].id);
      }
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    const currentIndex = applicationSteps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(applicationSteps[currentIndex - 1].id);
    }
  }, [currentStep]);

  const renderProgressBar = () => (
    <div style={progressBarContainerStyle}>
      <div style={progressHeaderStyle}>
        <h2 style={progressTitleStyle}>Education Loan Application</h2>
        <p style={progressSubtitleStyle}>Complete all steps to submit your application</p>
      </div>

      <div style={stepsRowStyle}>
        {applicationSteps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed;
          const isPast = applicationSteps.findIndex(s => s.id === currentStep) > index;

          return (
            <React.Fragment key={step.id}>
              <div
                style={{
                  ...stepCircleContainerStyle,
                  ...(isActive ? activeStepCircleStyle : {}),
                  ...(isCompleted || isPast ? completedStepCircleStyle : {})
                }}
                onClick={() => setCurrentStep(step.id)}
              >
                <div style={{
                  ...stepCircleStyle,
                  backgroundColor: isActive ? '#22c55e' : (isCompleted || isPast) ? '#22c55e' : '#e2e8f0',
                  borderColor: isActive ? '#22c55e' : (isCompleted || isPast) ? '#22c55e' : '#e2e8f0'
                }}>
                  {isCompleted || isPast ? (
                    <CheckCircle size={20} color="white" />
                  ) : (
                    <span style={{
                      ...stepNumberStyle,
                      color: isActive ? 'white' : '#64748b'
                    }}>{step.step}</span>
                  )}
                </div>
                <div style={stepLabelContainerStyle}>
                  <div style={{
                    ...stepTitleStyle,
                    color: isActive ? '#22c55e' : '#64748b'
                  }}>{step.title}</div>
                  <div style={stepDescriptionStyle}>{step.description}</div>
                </div>
              </div>
              {index < applicationSteps.length - 1 && (
                <div style={{
                  ...stepConnectorStyle,
                  backgroundColor: (isCompleted || isPast) ? '#22c55e' : '#e2e8f0'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderBasicInfoStep = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h3 style={formTitleStyle}>Basic Information</h3>
        <p style={formSubtitleStyle}>Please provide your contact details and loan requirements</p>
      </div>

      <div style={formContentStyle}>
        {/* Applicant Identity Section */}
        <div style={sectionHeaderStyle}>
          <User size={20} />
          <span>Applicant Details</span>
        </div>

        <div style={noteBoxStyle}>
          <AlertCircle size={16} color="#22c55e" />
          <div>
            <strong>Note:</strong>
            <ul style={noteListStyle}>
              <li>Enter name exactly as per your passport/identity documents</li>
              <li>Ensure email and phone are valid for OTP verification</li>
            </ul>
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>First Name *</label>
            <input
              type="text"
              value={formData.applicant?.firstName || ''}
              onChange={(e) => updateFormData('applicant', { firstName: e.target.value })}
              placeholder="Enter first name"
              style={inputStyle}
            />
            {errors.basic_info?.firstName && (
              <div style={errorMessageStyle}>{errors.basic_info.firstName}</div>
            )}
          </div>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Last Name *</label>
            <input
              type="text"
              value={formData.applicant?.lastName || ''}
              onChange={(e) => updateFormData('applicant', { lastName: e.target.value })}
              placeholder="Enter last name"
              style={inputStyle}
            />
            {errors.basic_info?.lastName && (
              <div style={errorMessageStyle}>{errors.basic_info.lastName}</div>
            )}
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Email Address *</label>
            <input
              type="email"
              value={formData.applicant?.email || ''}
              onChange={(e) => updateFormData('applicant', { email: e.target.value })}
              placeholder="Enter email address"
              style={inputStyle}
            />
            {errors.basic_info?.email && (
              <div style={errorMessageStyle}>{errors.basic_info.email}</div>
            )}
          </div>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Phone Number *</label>
            <input
              type="tel"
              value={formData.applicant?.phone || ''}
              onChange={(e) => updateFormData('applicant', { phone: e.target.value })}
              placeholder="Enter 10-digit mobile number"
              style={inputStyle}
              maxLength="10"
            />
            {errors.basic_info?.phone && (
              <div style={errorMessageStyle}>{errors.basic_info.phone}</div>
            )}
          </div>
        </div>

        {/* Loan Requirements Section */}
        <div style={{ ...sectionHeaderStyle, marginTop: '2rem' }}>
          <DollarSign size={20} />
          <span>Loan Requirements</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Loan Type *</label>
          <div style={radioGroupStyle}>
            {[
              { value: 'abroad', label: 'Education Loan for Abroad Studies', desc: 'For international universities and colleges' },
              { value: 'domestic', label: 'Education Loan for Domestic Studies', desc: 'For Indian universities and colleges' },
              { value: 'skill', label: 'Skill Development Loan', desc: 'For professional courses and certifications' }
            ].map(option => (
              <label key={option.value} style={radioOptionStyle}>
                <input
                  type="radio"
                  name="loanType"
                  value={option.value}
                  checked={formData.type?.loanType === option.value}
                  onChange={(e) => updateFormData('type', { loanType: e.target.value })}
                  style={radioInputStyle}
                />
                <div style={radioContentStyle}>
                  <div style={radioLabelStyle}>{option.label}</div>
                  <div style={radioDescStyle}>{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.basic_info?.loanType && (
            <div style={errorMessageStyle}>{errors.basic_info.loanType}</div>
          )}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Required Loan Amount (INR) *</label>
            <input
              type="number"
              value={formData.type?.loanAmount || ''}
              onChange={(e) => updateFormData('type', { loanAmount: e.target.value })}
              placeholder="Enter loan amount"
              style={inputStyle}
            />
            {errors.basic_info?.loanAmount && (
              <div style={errorMessageStyle}>{errors.basic_info.loanAmount}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Loan Tenure (Years)</label>
            <select
              value={formData.type?.tenure || ''}
              onChange={(e) => updateFormData('type', { tenure: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select tenure</option>
              <option value="5">5 Years</option>
              <option value="7">7 Years</option>
              <option value="10">10 Years</option>
              <option value="15">15 Years</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalDetailsStep = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h3 style={formTitleStyle}>Additional Personal Details</h3>
        <p style={formSubtitleStyle}>Please provide demographic information</p>
      </div>

      <div style={formContentStyle}>



        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Date of Birth *</label>
            <input
              type="date"
              value={formData.applicant?.dateOfBirth || ''}
              onChange={(e) => updateFormData('applicant', { dateOfBirth: e.target.value })}
              style={inputStyle}
            />
            {errors.applicant?.dateOfBirth && (
              <div style={errorMessageStyle}>{errors.applicant.dateOfBirth}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Gender *</label>
            <div style={radioGroupHorizontalStyle}>
              {['Male', 'Female', 'Other'].map(gender => (
                <label key={gender} style={radioOptionHorizontalStyle}>
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={formData.applicant?.gender === gender}
                    onChange={(e) => updateFormData('applicant', { gender: e.target.value })}
                    style={radioInputStyle}
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
            {errors.applicant?.gender && (
              <div style={errorMessageStyle}>{errors.applicant.gender}</div>
            )}
          </div>
        </div>



        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Nationality</label>
            <input
              type="text"
              value={formData.applicant?.nationality || 'Indian'}
              onChange={(e) => updateFormData('applicant', { nationality: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Marital Status</label>
            <select
              value={formData.applicant?.maritalStatus || ''}
              onChange={(e) => updateFormData('applicant', { maritalStatus: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>
      </div>
    </div >
  );

  const renderAcademicDetailsStep = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h3 style={formTitleStyle}>Academic Details</h3>
        <p style={formSubtitleStyle}>Enter your educational background and target program</p>
      </div>

      <div style={formContentStyle}>
        <div style={sectionHeaderStyle}>
          <GraduationCap size={20} color="#22c55e" />
          <span>Current Education</span>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Current Qualification *</label>
            <select
              value={formData.academic?.currentQualification || ''}
              onChange={(e) => updateFormData('academic', { currentQualification: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select qualification</option>
              <option value="12th">12th Standard</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
            </select>
            {errors.academic?.currentQualification && (
              <div style={errorMessageStyle}>{errors.academic.currentQualification}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Current Institution</label>
            <input
              type="text"
              value={formData.academic?.currentInstitution || ''}
              onChange={(e) => updateFormData('academic', { currentInstitution: e.target.value })}
              placeholder="Name of current institution"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Percentage/CGPA</label>
            <input
              type="text"
              value={formData.academic?.percentage || ''}
              onChange={(e) => updateFormData('academic', { percentage: e.target.value })}
              placeholder="e.g., 85% or 8.5 CGPA"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Year of Passing</label>
            <input
              type="number"
              value={formData.academic?.yearOfPassing || ''}
              onChange={(e) => updateFormData('academic', { yearOfPassing: e.target.value })}
              placeholder="YYYY"
              min="1990"
              max="2030"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={sectionHeaderStyle}>
          <Globe size={20} color="#22c55e" />
          <span>Target Program</span>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Target Country *</label>
            <select
              value={formData.academic?.targetCountry || ''}
              onChange={(e) => updateFormData('academic', { targetCountry: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select country</option>
              <option value="usa">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="canada">Canada</option>
              <option value="australia">Australia</option>
              <option value="germany">Germany</option>
              <option value="france">France</option>
              <option value="singapore">Singapore</option>
              <option value="netherlands">Netherlands</option>
              <option value="sweden">Sweden</option>
              <option value="ireland">Ireland</option>
            </select>
            {errors.academic?.targetCountry && (
              <div style={errorMessageStyle}>{errors.academic.targetCountry}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Course Level *</label>
            <select
              value={formData.academic?.courseLevel || ''}
              onChange={(e) => updateFormData('academic', { courseLevel: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select level</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="doctoral">Doctoral/PhD</option>
              <option value="diploma">Diploma/Certificate</option>
            </select>
            {errors.academic?.courseLevel && (
              <div style={errorMessageStyle}>{errors.academic.courseLevel}</div>
            )}
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Target University/Institution *</label>
          <input
            type="text"
            value={formData.academic?.targetUniversity || ''}
            onChange={(e) => updateFormData('academic', { targetUniversity: e.target.value })}
            placeholder="Name of target university"
            style={inputStyle}
          />
          {errors.academic?.targetUniversity && (
            <div style={errorMessageStyle}>{errors.academic.targetUniversity}</div>
          )}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Course/Program Name</label>
            <input
              type="text"
              value={formData.academic?.courseName || ''}
              onChange={(e) => updateFormData('academic', { courseName: e.target.value })}
              placeholder="e.g., Master of Science in Computer Science"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Course Duration (Years)</label>
            <select
              value={formData.academic?.courseDuration || ''}
              onChange={(e) => updateFormData('academic', { courseDuration: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select duration</option>
              <option value="1">1 Year</option>
              <option value="1.5">1.5 Years</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="4">4 Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Intake Session</label>
            <select
              value={formData.academic?.intakeSession || ''}
              onChange={(e) => updateFormData('academic', { intakeSession: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select intake</option>
              <option value="fall-2024">Fall 2024</option>
              <option value="spring-2025">Spring 2025</option>
              <option value="fall-2025">Fall 2025</option>
              <option value="spring-2026">Spring 2026</option>
            </select>
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Estimated Tuition Fee (Annual)</label>
            <input
              type="number"
              value={formData.academic?.tuitionFee || ''}
              onChange={(e) => updateFormData('academic', { tuitionFee: e.target.value })}
              placeholder="Enter amount in INR"
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialDetailsStep = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h3 style={formTitleStyle}>Financial Details</h3>
        <p style={formSubtitleStyle}>Enter your financial information for loan assessment</p>
      </div>

      <div style={formContentStyle}>
        <div style={sectionHeaderStyle}>
          <CreditCard size={20} color="#22c55e" />
          <span>Income Information</span>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Employment Status *</label>
            <select
              value={formData.financial?.employmentStatus || ''}
              onChange={(e) => updateFormData('financial', { employmentStatus: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select status</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self Employed</option>
              <option value="business">Business Owner</option>
              <option value="student">Student</option>
              <option value="unemployed">Unemployed</option>
            </select>
            {errors.financial?.employmentStatus && (
              <div style={errorMessageStyle}>{errors.financial.employmentStatus}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Annual Income (INR) *</label>
            <input
              type="number"
              value={formData.financial?.annualIncome || ''}
              onChange={(e) => updateFormData('financial', { annualIncome: e.target.value })}
              placeholder="Enter annual income"
              style={inputStyle}
            />
            {errors.financial?.annualIncome && (
              <div style={errorMessageStyle}>{errors.financial.annualIncome}</div>
            )}
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Employer Name</label>
            <input
              type="text"
              value={formData.financial?.employerName || ''}
              onChange={(e) => updateFormData('financial', { employerName: e.target.value })}
              placeholder="Name of employer/company"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Work Experience (Years)</label>
            <select
              value={formData.financial?.workExperience || ''}
              onChange={(e) => updateFormData('financial', { workExperience: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 Years</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5-10">5-10 Years</option>
              <option value="10+">10+ Years</option>
            </select>
          </div>
        </div>

        <div style={sectionHeaderStyle}>
          <span>Assets & Liabilities</span>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Existing Loans (EMI Amount)</label>
            <input
              type="number"
              value={formData.financial?.existingEMI || ''}
              onChange={(e) => updateFormData('financial', { existingEMI: e.target.value })}
              placeholder="Monthly EMI amount"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Credit Card Outstanding</label>
            <input
              type="number"
              value={formData.financial?.creditCardOutstanding || ''}
              onChange={(e) => updateFormData('financial', { creditCardOutstanding: e.target.value })}
              placeholder="Outstanding amount"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Bank Account Balance</label>
            <input
              type="number"
              value={formData.financial?.bankBalance || ''}
              onChange={(e) => updateFormData('financial', { bankBalance: e.target.value })}
              placeholder="Current bank balance"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Fixed Deposits/Investments</label>
            <input
              type="number"
              value={formData.financial?.investments || ''}
              onChange={(e) => updateFormData('financial', { investments: e.target.value })}
              placeholder="FD/Investment value"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Property Owned</label>
          <div style={radioGroupHorizontalStyle}>
            {['Yes', 'No'].map(option => (
              <label key={option} style={radioOptionHorizontalStyle}>
                <input
                  type="radio"
                  name="propertyOwned"
                  value={option}
                  checked={formData.financial?.propertyOwned === option}
                  onChange={(e) => updateFormData('financial', { propertyOwned: e.target.value })}
                  style={radioInputStyle}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.financial?.propertyOwned === 'Yes' && (
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Property Value (INR)</label>
            <input
              type="number"
              value={formData.financial?.propertyValue || ''}
              onChange={(e) => updateFormData('financial', { propertyValue: e.target.value })}
              placeholder="Estimated property value"
              style={inputStyle}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderFamilyDetailsStep = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h3 style={formTitleStyle}>Family Details</h3>
        <p style={formSubtitleStyle}>Enter parent/guardian information for co-applicant details</p>
      </div>

      <div style={formContentStyle}>
        <div style={sectionHeaderStyle}>
          <Users size={20} color="#22c55e" />
          <span>Parent/Guardian Information</span>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Father's Name *</label>
            <input
              type="text"
              value={formData.family?.fatherName || ''}
              onChange={(e) => updateFormData('family', { fatherName: e.target.value })}
              placeholder="Enter father's full name"
              style={inputStyle}
            />
            {errors.family?.fatherName && (
              <div style={errorMessageStyle}>{errors.family.fatherName}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Mother's Name *</label>
            <input
              type="text"
              value={formData.family?.motherName || ''}
              onChange={(e) => updateFormData('family', { motherName: e.target.value })}
              placeholder="Enter mother's full name"
              style={inputStyle}
            />
            {errors.family?.motherName && (
              <div style={errorMessageStyle}>{errors.family.motherName}</div>
            )}
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Father's Occupation</label>
            <input
              type="text"
              value={formData.family?.fatherOccupation || ''}
              onChange={(e) => updateFormData('family', { fatherOccupation: e.target.value })}
              placeholder="Father's occupation"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Mother's Occupation</label>
            <input
              type="text"
              value={formData.family?.motherOccupation || ''}
              onChange={(e) => updateFormData('family', { motherOccupation: e.target.value })}
              placeholder="Mother's occupation"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Father's Annual Income</label>
            <input
              type="number"
              value={formData.family?.fatherIncome || ''}
              onChange={(e) => updateFormData('family', { fatherIncome: e.target.value })}
              placeholder="Annual income in INR"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Mother's Annual Income</label>
            <input
              type="number"
              value={formData.family?.motherIncome || ''}
              onChange={(e) => updateFormData('family', { motherIncome: e.target.value })}
              placeholder="Annual income in INR"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Father's Phone Number</label>
            <input
              type="tel"
              value={formData.family?.fatherPhone || ''}
              onChange={(e) => updateFormData('family', { fatherPhone: e.target.value })}
              placeholder="10-digit mobile number"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Mother's Phone Number</label>
            <input
              type="tel"
              value={formData.family?.motherPhone || ''}
              onChange={(e) => updateFormData('family', { motherPhone: e.target.value })}
              placeholder="10-digit mobile number"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Number of Dependents</label>
          <select
            value={formData.family?.dependents || ''}
            onChange={(e) => updateFormData('family', { dependents: e.target.value })}
            style={selectStyle}
          >
            <option value="">Select number</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
        </div>

        <div style={sectionHeaderStyle}>
          <span>Co-Applicant Details (Optional)</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Co-Applicant Required?</label>
          <div style={radioGroupHorizontalStyle}>
            {['Yes', 'No'].map(option => (
              <label key={option} style={radioOptionHorizontalStyle}>
                <input
                  type="radio"
                  name="coApplicantRequired"
                  value={option}
                  checked={formData.family?.coApplicantRequired === option}
                  onChange={(e) => updateFormData('family', { coApplicantRequired: e.target.value })}
                  style={radioInputStyle}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.family?.coApplicantRequired === 'Yes' && (
          <>
            <div style={fieldRowStyle}>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Co-Applicant Name</label>
                <input
                  type="text"
                  value={formData.family?.coApplicantName || ''}
                  onChange={(e) => updateFormData('family', { coApplicantName: e.target.value })}
                  placeholder="Full name of co-applicant"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Relationship</label>
                <select
                  value={formData.family?.coApplicantRelation || ''}
                  onChange={(e) => updateFormData('family', { coApplicantRelation: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Select relationship</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="guardian">Guardian</option>
                </select>
              </div>
            </div>

            <div style={fieldRowStyle}>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Co-Applicant Income</label>
                <input
                  type="number"
                  value={formData.family?.coApplicantIncome || ''}
                  onChange={(e) => updateFormData('family', { coApplicantIncome: e.target.value })}
                  placeholder="Annual income in INR"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Co-Applicant Phone</label>
                <input
                  type="tel"
                  value={formData.family?.coApplicantPhone || ''}
                  onChange={(e) => updateFormData('family', { coApplicantPhone: e.target.value })}
                  placeholder="10-digit mobile number"
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderAddressDetailsStep = () => (
    <div style={formContainerStyle}>
      <div style={formHeaderStyle}>
        <h3 style={formTitleStyle}>Address Details</h3>
        <p style={formSubtitleStyle}>Enter your current and permanent address information</p>
      </div>

      <div style={formContentStyle}>
        <div style={sectionHeaderStyle}>
          <Home size={20} color="#22c55e" />
          <span>Current Address</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Address Line 1 *</label>
          <input
            type="text"
            value={formData.address?.currentAddress || ''}
            onChange={(e) => updateFormData('address', { currentAddress: e.target.value })}
            placeholder="House/Flat No., Building Name, Street"
            style={inputStyle}
          />
          {errors.address?.currentAddress && (
            <div style={errorMessageStyle}>{errors.address.currentAddress}</div>
          )}
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Address Line 2</label>
          <input
            type="text"
            value={formData.address?.currentAddress2 || ''}
            onChange={(e) => updateFormData('address', { currentAddress2: e.target.value })}
            placeholder="Area, Locality, Landmark"
            style={inputStyle}
          />
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>City *</label>
            <input
              type="text"
              value={formData.address?.city || ''}
              onChange={(e) => updateFormData('address', { city: e.target.value })}
              placeholder="Enter city"
              style={inputStyle}
            />
            {errors.address?.city && (
              <div style={errorMessageStyle}>{errors.address.city}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>State *</label>
            <select
              value={formData.address?.state || ''}
              onChange={(e) => updateFormData('address', { state: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select state</option>
              <option value="andhra-pradesh">Andhra Pradesh</option>
              <option value="arunachal-pradesh">Arunachal Pradesh</option>
              <option value="assam">Assam</option>
              <option value="bihar">Bihar</option>
              <option value="chhattisgarh">Chhattisgarh</option>
              <option value="goa">Goa</option>
              <option value="gujarat">Gujarat</option>
              <option value="haryana">Haryana</option>
              <option value="himachal-pradesh">Himachal Pradesh</option>
              <option value="jharkhand">Jharkhand</option>
              <option value="karnataka">Karnataka</option>
              <option value="kerala">Kerala</option>
              <option value="madhya-pradesh">Madhya Pradesh</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="manipur">Manipur</option>
              <option value="meghalaya">Meghalaya</option>
              <option value="mizoram">Mizoram</option>
              <option value="nagaland">Nagaland</option>
              <option value="odisha">Odisha</option>
              <option value="punjab">Punjab</option>
              <option value="rajasthan">Rajasthan</option>
              <option value="sikkim">Sikkim</option>
              <option value="tamil-nadu">Tamil Nadu</option>
              <option value="telangana">Telangana</option>
              <option value="tripura">Tripura</option>
              <option value="uttar-pradesh">Uttar Pradesh</option>
              <option value="uttarakhand">Uttarakhand</option>
              <option value="west-bengal">West Bengal</option>
              <option value="delhi">Delhi</option>
            </select>
            {errors.address?.state && (
              <div style={errorMessageStyle}>{errors.address.state}</div>
            )}
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>PIN Code *</label>
            <input
              type="text"
              value={formData.address?.pincode || ''}
              onChange={(e) => updateFormData('address', { pincode: e.target.value })}
              placeholder="6-digit PIN code"
              maxLength="6"
              style={inputStyle}
            />
            {errors.address?.pincode && (
              <div style={errorMessageStyle}>{errors.address.pincode}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Country</label>
            <input
              type="text"
              value={formData.address?.country || 'India'}
              onChange={(e) => updateFormData('address', { country: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Residence Type</label>
          <div style={radioGroupHorizontalStyle}>
            {['Owned', 'Rented', 'Family Owned'].map(type => (
              <label key={type} style={radioOptionHorizontalStyle}>
                <input
                  type="radio"
                  name="residenceType"
                  value={type}
                  checked={formData.address?.residenceType === type}
                  onChange={(e) => updateFormData('address', { residenceType: e.target.value })}
                  style={radioInputStyle}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={sectionHeaderStyle}>
          <MapPin size={20} color="#22c55e" />
          <span>Permanent Address</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={fieldLabelStyle}>Same as Current Address?</label>
          <div style={radioGroupHorizontalStyle}>
            {['Yes', 'No'].map(option => (
              <label key={option} style={radioOptionHorizontalStyle}>
                <input
                  type="radio"
                  name="sameAddress"
                  value={option}
                  checked={formData.address?.sameAddress === option}
                  onChange={(e) => {
                    updateFormData('address', { sameAddress: e.target.value });
                    if (e.target.value === 'Yes') {
                      updateFormData('address', {
                        permanentAddress: formData.address?.currentAddress,
                        permanentAddress2: formData.address?.currentAddress2,
                        permanentCity: formData.address?.city,
                        permanentState: formData.address?.state,
                        permanentPincode: formData.address?.pincode,
                        permanentCountry: formData.address?.country
                      });
                    }
                  }}
                  style={radioInputStyle}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.address?.sameAddress === 'No' && (
          <>
            <div style={fieldGroupStyle}>
              <label style={fieldLabelStyle}>Permanent Address Line 1</label>
              <input
                type="text"
                value={formData.address?.permanentAddress || ''}
                onChange={(e) => updateFormData('address', { permanentAddress: e.target.value })}
                placeholder="House/Flat No., Building Name, Street"
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={fieldLabelStyle}>Permanent Address Line 2</label>
              <input
                type="text"
                value={formData.address?.permanentAddress2 || ''}
                onChange={(e) => updateFormData('address', { permanentAddress2: e.target.value })}
                placeholder="Area, Locality, Landmark"
                style={inputStyle}
              />
            </div>

            <div style={fieldRowStyle}>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Permanent City</label>
                <input
                  type="text"
                  value={formData.address?.permanentCity || ''}
                  onChange={(e) => updateFormData('address', { permanentCity: e.target.value })}
                  placeholder="Enter city"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Permanent State</label>
                <select
                  value={formData.address?.permanentState || ''}
                  onChange={(e) => updateFormData('address', { permanentState: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Select state</option>
                  <option value="andhra-pradesh">Andhra Pradesh</option>
                  <option value="arunachal-pradesh">Arunachal Pradesh</option>
                  <option value="assam">Assam</option>
                  <option value="bihar">Bihar</option>
                  <option value="chhattisgarh">Chhattisgarh</option>
                  <option value="goa">Goa</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="haryana">Haryana</option>
                  <option value="himachal-pradesh">Himachal Pradesh</option>
                  <option value="jharkhand">Jharkhand</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="kerala">Kerala</option>
                  <option value="madhya-pradesh">Madhya Pradesh</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="manipur">Manipur</option>
                  <option value="meghalaya">Meghalaya</option>
                  <option value="mizoram">Mizoram</option>
                  <option value="nagaland">Nagaland</option>
                  <option value="odisha">Odisha</option>
                  <option value="punjab">Punjab</option>
                  <option value="rajasthan">Rajasthan</option>
                  <option value="sikkim">Sikkim</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="telangana">Telangana</option>
                  <option value="tripura">Tripura</option>
                  <option value="uttar-pradesh">Uttar Pradesh</option>
                  <option value="uttarakhand">Uttarakhand</option>
                  <option value="west-bengal">West Bengal</option>
                  <option value="delhi">Delhi</option>
                </select>
              </div>
            </div>

            <div style={fieldRowStyle}>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Permanent PIN Code</label>
                <input
                  type="text"
                  value={formData.address?.permanentPincode || ''}
                  onChange={(e) => updateFormData('address', { permanentPincode: e.target.value })}
                  placeholder="6-digit PIN code"
                  maxLength="6"
                  style={inputStyle}
                />
              </div>

              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Permanent Country</label>
                <input
                  type="text"
                  value={formData.address?.permanentCountry || 'India'}
                  onChange={(e) => updateFormData('address', { permanentCountry: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const handleFileUpload = async (docType, file) => {
    if (file) {
      try {
        if (applicationId) {
          const response = await loanApplicationAPI.uploadDocument(applicationId, docType, file);
          setUploadedDocs(prev => ({
            ...prev,
            [docType]: {
              ...response.data,
              file: file,
              dataUrl: URL.createObjectURL(file),
              uploadedAt: new Date().toISOString()
            }
          }));
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadedDocs(prev => ({
              ...prev,
              [docType]: {
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: e.target.result,
                uploadedAt: new Date().toISOString()
              }
            }));
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('File upload error:', error);
        alert('Failed to upload document. Please try again.');
      }
    }
  };

  const removeDocument = (docType) => {
    setUploadedDocs(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
  };

  const renderDocumentsStep = () => {
    const requiredDocs = [
      { id: 'photo', name: 'Passport Size Photo', required: true, formats: 'JPG, PNG (Max 2MB)' },
      { id: 'identity', name: 'Identity Proof', required: true, formats: 'Aadhaar/Passport/Voter ID (PDF, JPG)' },
      { id: 'address', name: 'Address Proof', required: true, formats: 'Utility Bill/Bank Statement (PDF, JPG)' },
      { id: 'income', name: 'Income Proof', required: true, formats: 'Salary Slip/ITR (PDF)' },
      { id: 'academic', name: 'Academic Documents', required: true, formats: 'Marksheets/Certificates (PDF)' },
      { id: 'admission', name: 'Admission Letter', required: false, formats: 'University Offer Letter (PDF)' },
      { id: 'bank', name: 'Bank Statements', required: true, formats: 'Last 6 months (PDF)' },
      { id: 'collateral', name: 'Collateral Documents', required: false, formats: 'Property Papers (PDF)' }
    ];

    return (
      <div style={formContainerStyle}>
        <div style={formHeaderStyle}>
          <h3 style={formTitleStyle}>Document Upload</h3>
          <p style={formSubtitleStyle}>Upload all required documents for loan processing</p>
        </div>

        <div style={formContentStyle}>
          <div style={noteBoxStyle}>
            <AlertCircle size={16} color="#22c55e" />
            <div>
              <strong>Document Guidelines:</strong>
              <ul style={noteListStyle}>
                <li>All documents should be clear and readable</li>
                <li>File size should not exceed 5MB per document</li>
                <li>Accepted formats: PDF, JPG, PNG</li>
                <li>Ensure all information is visible and not cropped</li>
              </ul>
            </div>
          </div>

          {errors.documents?.documents && (
            <div style={{
              ...errorMessageStyle,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {errors.documents.documents}
            </div>
          )}

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {requiredDocs.map(doc => (
              <div key={doc.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                backgroundColor: uploadedDocs[doc.id] ? '#f0fdf4' : '#fafafa'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#374151',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {doc.name} {doc.required && <span style={{ color: '#dc2626' }}>*</span>}
                    </h4>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      margin: 0
                    }}>
                      {doc.formats}
                    </p>
                  </div>

                  {uploadedDocs[doc.id] && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => window.open(uploadedDocs[doc.id].dataUrl, '_blank')}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#22c55e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {uploadedDocs[doc.id] ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.5rem'
                  }}>
                    <CheckCircle size={20} color="#22c55e" />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#374151',
                        margin: 0
                      }}>
                        {uploadedDocs[doc.id].name}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        margin: 0
                      }}>
                        {(uploadedDocs[doc.id].size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(uploadedDocs[doc.id].uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.5rem',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                    onClick={() => document.getElementById(`file-${doc.id}`).click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        handleFileUpload(doc.id, files[0]);
                      }
                    }}
                  >
                    <Upload size={32} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Click to upload or drag and drop
                    </p>
                    <input
                      id={`file-${doc.id}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(doc.id, e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewStep = () => {
    const getSectionData = (section) => formData[section] || {};

    return (
      <div style={formContainerStyle}>
        <div style={formHeaderStyle}>
          <h3 style={formTitleStyle}>Application Review</h3>
          <p style={formSubtitleStyle}>Please review all information before submitting your application</p>
        </div>

        <div style={formContentStyle}>
          <div style={noteBoxStyle}>
            <AlertCircle size={16} color="#22c55e" />
            <div>
              <strong>Important:</strong> Please verify all information is correct. Once submitted, changes may require additional documentation.
            </div>
          </div>

          {/* Loan Type Summary */}
          <div style={sectionHeaderStyle}>
            <FileCheck size={20} color="#22c55e" />
            <span>Loan Information</span>
          </div>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={fieldRowStyle}>
              <div><strong>Loan Type:</strong> {getSectionData('type').loanType || 'Not specified'}</div>
              <div><strong>Amount:</strong> ₹{getSectionData('type').loanAmount || 'Not specified'}</div>
            </div>
            <div><strong>Tenure:</strong> {getSectionData('type').tenure || 'Not specified'} years</div>
          </div>

          {/* Personal Details Summary */}
          <div style={sectionHeaderStyle}>
            <User size={20} color="#22c55e" />
            <span>Personal Information</span>
          </div>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={fieldRowStyle}>
              <div><strong>Name:</strong> {getSectionData('applicant').firstName} {getSectionData('applicant').lastName}</div>
              <div><strong>Date of Birth:</strong> {getSectionData('applicant').dateOfBirth || 'Not specified'}</div>
            </div>
            <div style={fieldRowStyle}>
              <div><strong>Email:</strong> {getSectionData('applicant').email || 'Not specified'}</div>
              <div><strong>Phone:</strong> {getSectionData('applicant').phone || 'Not specified'}</div>
            </div>
            <div><strong>Gender:</strong> {getSectionData('applicant').gender || 'Not specified'}</div>
          </div>

          {/* Academic Details Summary */}
          <div style={sectionHeaderStyle}>
            <GraduationCap size={20} color="#22c55e" />
            <span>Academic Information</span>
          </div>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={fieldRowStyle}>
              <div><strong>Current Qualification:</strong> {getSectionData('academic').currentQualification || 'Not specified'}</div>
              <div><strong>Target Country:</strong> {getSectionData('academic').targetCountry || 'Not specified'}</div>
            </div>
            <div style={fieldRowStyle}>
              <div><strong>Target University:</strong> {getSectionData('academic').targetUniversity || 'Not specified'}</div>
              <div><strong>Course Level:</strong> {getSectionData('academic').courseLevel || 'Not specified'}</div>
            </div>
          </div>

          {/* Financial Details Summary */}
          <div style={sectionHeaderStyle}>
            <CreditCard size={20} color="#22c55e" />
            <span>Financial Information</span>
          </div>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <div style={fieldRowStyle}>
              <div><strong>Employment Status:</strong> {getSectionData('financial').employmentStatus || 'Not specified'}</div>
              <div><strong>Annual Income:</strong> ₹{getSectionData('financial').annualIncome || 'Not specified'}</div>
            </div>
            <div><strong>Employer:</strong> {getSectionData('financial').employerName || 'Not specified'}</div>
          </div>

          {/* Documents Summary */}
          <div style={sectionHeaderStyle}>
            <FileText size={20} color="#22c55e" />
            <span>Uploaded Documents</span>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            {Object.keys(uploadedDocs).length > 0 ? (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {Object.entries(uploadedDocs).map(([docType, doc]) => (
                  <div key={docType} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.5rem'
                  }}>
                    <CheckCircle size={16} color="#22c55e" />
                    <span style={{ fontSize: '0.875rem' }}>{doc.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No documents uploaded</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Terms and Conditions</h4>
            <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              <p>By submitting this application, I acknowledge that:</p>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li>All information provided is true and accurate to the best of my knowledge</li>
                <li>I authorize Kubera to verify the information provided</li>
                <li>I understand that providing false information may result in rejection of my application</li>
                <li>I agree to the terms and conditions of the education loan</li>
                <li>I consent to credit checks and background verification</li>
              </ul>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.preview?.termsAccepted || false}
                onChange={(e) => updateFormData('preview', { termsAccepted: e.target.checked })}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                I agree to the terms and conditions *
              </span>
            </label>

            {!formData.preview?.termsAccepted && errors.preview?.termsAccepted && (
              <div style={{
                ...errorMessageStyle,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '1rem',
                fontSize: '0.875rem'
              }}>
                {errors.preview.termsAccepted}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };



  const handleSubmit = async () => {
    if (!validateAllSteps()) {
      alert('Please fill in all required fields in all steps before submitting.');
      return;
    }

    // The termsAccepted check should still be here as it's a specific preview step validation
    if (!formData.preview?.termsAccepted) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalApplicationId = applicationId;

      if (!finalApplicationId) {
        const response = await loanApplicationAPI.createApplication(formData);
        finalApplicationId = response.data.id;
        setApplicationId(finalApplicationId);
      }

      const submitResponse = await loanApplicationAPI.submitApplication(finalApplicationId);

      localStorage.removeItem('kubera_loan_application');

      alert(`Application submitted successfully! Your application number is: ${submitResponse.data.applicationNumber}`);

      setFormData({});
      setUploadedDocs({});
      setApplicationId(null);
      setCurrentStep('type');
      setCurrentPage('dashboard'); // Redirect to dashboard after successful submission

    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProfilePage = () => {
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploading(true);
        const result = await updateProfilePicture(file);
        if (result.success) {
          alert('Profile picture updated successfully!');
        } else {
          alert('Failed to update profile picture: ' + result.error);
        }
        setUploading(false);
      }
    };

    return (
      <div>
        <div style={breadcrumbStyle}>
          <span>Profile Settings</span>
        </div>
        <div style={formContainerStyle}>
          <div style={formHeaderStyle}>
            <h3 style={formTitleStyle}>User Profile</h3>
            <p style={formSubtitleStyle}>Manage your account information and visual identity</p>
          </div>
          <div style={formContentStyle}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to right, #4285F4, #DB4437, #F4B400, #0F9D58)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {user?.picture ? (
                      <img
                        src={user.picture.startsWith('http') ? user.picture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.picture}`}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}

                    {uploading && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#22c55e' }} />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#475569'
                  }}
                  title="Change Profile Picture"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
              </div>
              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                Allowed files: JPG, PNG, GIF (Max 5MB)
              </p>
            </div>

            <div style={fieldRowStyle}>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Full Name</label>
                <input type="text" value={user?.name || ''} readOnly style={{ ...inputStyle, backgroundColor: '#f8fafc' }} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Email Address</label>
                <input type="email" value={user?.email || ''} readOnly style={{ ...inputStyle, backgroundColor: '#f8fafc' }} />
              </div>
            </div>
            {/* Additional fields can be added here */}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic_info':
        return renderBasicInfoStep();
      case 'personal_details':
        return renderPersonalDetailsStep();
      case 'academic': return renderAcademicDetailsStep();
      case 'financial': return renderFinancialDetailsStep();
      case 'family': return renderFamilyDetailsStep();
      case 'address': return renderAddressDetailsStep();
      case 'documents': return renderDocumentsStep();
      case 'preview': return renderPreviewStep();
      default: return renderBasicInfoStep();
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboardPage();
      case 'loan-application':
        return renderLoanApplicationPage();
      case 'my-applications':
        return renderMyApplicationsPage();
      case 'loan-calculator':
        return renderLoanCalculatorPage();
      case 'documents':
        return renderDocumentsPage();
      case 'profile':
        return renderProfilePage();
      case 'settings':
        return renderSettingsPage();
      default:
        return renderLoanApplicationPage();
    }
  };



  const renderDashboardPage = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
        <p className="dashboard-subtitle">Manage your education loan applications and documents.</p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Apply Card */}
        <div className="stat-card" onClick={() => setCurrentPage('loan-application')} style={{ cursor: 'pointer', borderLeft: '4px solid #22c55e' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#dcfce7' }}>
            <FileText size={24} color="#16a34a" />
          </div>
          <p className="stat-value">Apply</p>
          <p className="stat-label">Start New Application</p>
        </div>

        {/* EMI Calculator */}
        <div className="stat-card" onClick={() => setCurrentPage('loan-calculator')} style={{ cursor: 'pointer', borderLeft: '4px solid #0891b2' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfeff' }}>
            <DollarSign size={24} color="#0891b2" />
          </div>
          <p className="stat-value">EMI</p>
          <p className="stat-label">Loan Calculator</p>
        </div>

        {/* Track Status */}
        <div className="stat-card" onClick={() => setCurrentPage('my-applications')} style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
            <Activity size={24} color="#d97706" />
          </div>
          <p className="stat-value">Track</p>
          <p className="stat-label">My Applications</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="#64748b" /> Recent Activity
        </h3>

        {/* Placeholder for no activity - can be dynamic later */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          border: '1px dashed #cbd5e1'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#f1f5f9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <TrendingUp size={32} color="#94a3b8" />
          </div>
          <h4 style={{ color: '#475569', marginBottom: '0.5rem' }}>No recent activity</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Your recent loan application status updates will appear here.</p>
        </div>
      </div>
    </div>
  );

  const renderLoanApplicationPage = () => (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
        <h2 className="dashboard-title">Loan Application</h2>
        <p className="dashboard-subtitle">Complete the steps below to apply for an education loan.</p>
      </div>

      <div className="stepper-wrapper">
        {applicationSteps.map((s, index) => {
          const isCompleted = applicationSteps.findIndex(step => step.id === currentStep) > index;
          const isActive = s.id === currentStep;

          return (
            <div key={s.id} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              <div className="step-circle">
                {isCompleted ? <CheckCircle size={16} /> : s.step}
              </div>
              <span className="step-label">{s.title}</span>
            </div>
          );
        })}
      </div>

      <div className="form-section">
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
              {applicationSteps.find(s => s.id === currentStep)?.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {applicationSteps.find(s => s.id === currentStep)?.description}
            </p>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
            Fields marked with (*) are required
          </div>
        </div>

        {renderCurrentStep()}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 'basic_info'}
            className="btn-secondary"
            style={{ opacity: currentStep === 'basic_info' ? 0.5 : 1, cursor: currentStep === 'basic_info' ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={saveToBackend} className="btn-secondary" style={{ color: '#d97706', borderColor: '#fcd34d', background: '#fffbeb' }}>
              <Save size={16} style={{ marginRight: '0.5rem' }} />
              Save Draft
            </button>

            <button
              onClick={currentStep === 'preview' ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className="btn-primary"
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                  Processing...
                </>
              ) : (
                currentStep === 'preview' ? 'Submit Application' : 'Next Step'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyApplicationsPage = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">My Applications</h2>
        <p className="dashboard-subtitle">Track the status of your submitted loan applications.</p>
      </div>

      <div className="form-section" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <FileBarChart size={40} color="#94a3b8" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
          No Applications Found
        </h3>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '400px', textAlign: 'center' }}>
          You haven't submitted any loan applications yet. Start your journey today!
        </p>
        <button
          onClick={() => setCurrentPage('loan-application')}
          className="btn-primary"
        >
          <FileText size={18} />
          Start New Application
        </button>
      </div>
    </div>
  );

  const renderLoanCalculatorPage = () => (
    <div>
      <div style={breadcrumbStyle}>
        <span>Loan Calculator</span>
      </div>
      <div style={formContainerStyle}>
        <div style={formHeaderStyle}>
          <h3 style={formTitleStyle}>EMI Calculator</h3>
          <p style={formSubtitleStyle}>Calculate your monthly EMI and plan your finances</p>
        </div>
        <div style={formContentStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Loan Amount (INR)</label>
                <input type="number" placeholder="Enter loan amount" style={inputStyle} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Interest Rate (%)</label>
                <input type="number" placeholder="Enter interest rate" style={inputStyle} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Loan Tenure (Years)</label>
                <select style={selectStyle}>
                  <option>Select tenure</option>
                  <option>5 Years</option>
                  <option>7 Years</option>
                  <option>10 Years</option>
                  <option>15 Years</option>
                </select>
              </div>
              <button style={nextButtonStyle}>Calculate EMI</button>
            </div>
            <div style={{ padding: '2rem', backgroundColor: '#f0fdf4', borderRadius: '1rem', border: '1px solid #bbf7d0' }}>
              <h4 style={{ color: '#22c55e', marginBottom: '1rem' }}>EMI Breakdown</h4>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                <p>Monthly EMI: <strong>₹ --</strong></p>
                <p>Total Interest: <strong>₹ --</strong></p>
                <p>Total Amount: <strong>₹ --</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentsPage = () => (
    <div>
      <div style={breadcrumbStyle}>
        <span>Document Manager</span>
      </div>
      <div style={formContainerStyle}>
        <div style={formHeaderStyle}>
          <h3 style={formTitleStyle}>Document Repository</h3>
          <p style={formSubtitleStyle}>Manage and organize your documents</p>
        </div>
        <div style={formContentStyle}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileCheck size={64} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h4>No Documents Uploaded</h4>
            <p>Upload and manage your documents for loan applications.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfilePage_deprecated = () => {
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploading(true);
        const result = await updateProfilePicture(file);
        if (result.success) {
          alert('Profile picture updated successfully!');
        } else {
          alert('Failed to update profile picture: ' + result.error);
        }
        setUploading(false);
      }
    };

    return (
      <div>
        <div style={breadcrumbStyle}>
          <span>Profile Settings</span>
        </div>
        <div style={formContainerStyle}>
          <div style={formHeaderStyle}>
            <h3 style={formTitleStyle}>User Profile</h3>
            <p style={formSubtitleStyle}>Manage your account information and visual identity</p>
          </div>
          <div style={formContentStyle}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to right, #4285F4, #DB4437, #F4B400, #0F9D58)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {user?.picture ? (
                      <img
                        src={user.picture.startsWith('http') ? user.picture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.picture}`}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}

                    {uploading && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#22c55e' }} />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#475569'
                  }}
                  title="Change Profile Picture"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
              </div>
              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                Allowed files: JPG, PNG, GIF (Max 5MB)
              </p>
            </div>

            <div style={fieldRowStyle}>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Full Name</label>
                <input type="text" value={user?.name || ''} readOnly style={{ ...inputStyle, backgroundColor: '#f8fafc' }} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={fieldLabelStyle}>Email Address</label>
                <input type="email" value={user?.email || ''} readOnly style={{ ...inputStyle, backgroundColor: '#f8fafc' }} />
              </div>
            </div>
            {/* Additional fields can be added here */}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsPage = () => (
    <div>
      <div style={breadcrumbStyle}>
        <span>Settings</span>
      </div>
      <div style={formContainerStyle}>
        <div style={formHeaderStyle}>
          <h3 style={formTitleStyle}>Application Settings</h3>
          <p style={formSubtitleStyle}>Configure your preferences</p>
        </div>
        <div style={formContentStyle}>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Language Preference</label>
            <select style={selectStyle}>
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Telugu</option>
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Notification Preferences</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                <span>Email Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                <span>SMS Notifications</span>
              </label>
            </div>
          </div>
          <button style={nextButtonStyle}>Save Settings</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={logoSectionStyle}>
          <div style={logoStyle}>
            <Building2 size={32} color="#22c55e" />
          </div>
          <div>
            <h1 style={titleStyle}>Kubera</h1>
            <p style={subtitleStyle}>Education Finance Portal</p>
          </div>
        </div>
        <div style={userInfoStyle}>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {new Date().toLocaleTimeString('en-US')}</span>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'transform 0.2s',
                padding: '2px', // Spacing for the ring
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(to right, #4285F4, #DB4437, #F4B400, #0F9D58)',
                padding: '2px', // Thickness of the ring
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {user?.picture ? (
                    <img
                      src={user.picture.startsWith('http') ? user.picture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.picture}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      color: '#333'
                    }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                minWidth: '220px',
                zIndex: 50,
                overflow: 'hidden',
                py: '0.5rem',
                color: '#334155'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold', color: '#0f172a' }}>{user?.name || 'Student User'}</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</p>
                </div>

                <div style={{ padding: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setShowProfileMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#475569',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User size={16} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('my-applications');
                      setShowProfileMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#475569',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FileBarChart size={16} />
                    My Applications
                  </button>

                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0.5rem 0' }} />

                  <button
                    onClick={logout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#ef4444',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={mainContentStyle}>
        <div style={{
          ...sidebarStyle,
          width: sidebarCollapsed ? '60px' : '280px',
          transition: 'width 0.3s ease'
        }}>
          <div style={sidebarHeaderStyle}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e'
              }}
            >
              <Menu size={24} />
            </button>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={sidebarLogoStyle}>
                  <Building2 size={24} color="#22c55e" />
                </div>
                <div>
                  <h2 style={sidebarTitleStyle}>Kubera</h2>
                  <p style={sidebarSubtitleStyle}>Education Finance</p>
                </div>
              </div>
            )}
          </div>

          <nav className="sidebar-nav-list" style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              className={`sidebar-nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <Home size={20} />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </div>

            <div
              className={`sidebar-nav-item ${currentPage === 'loan-application' ? 'active' : ''}`}
              onClick={() => setCurrentPage('loan-application')}
            >
              <FileText size={20} />
              {!sidebarCollapsed && <span>Loan Application</span>}
            </div>

            <div
              className={`sidebar-nav-item ${currentPage === 'my-applications' ? 'active' : ''}`}
              onClick={() => setCurrentPage('my-applications')}
            >
              <FileBarChart size={20} />
              {!sidebarCollapsed && <span>My Applications</span>}
            </div>

            <div
              className={`sidebar-nav-item ${currentPage === 'loan-calculator' ? 'active' : ''}`}
              onClick={() => setCurrentPage('loan-calculator')}
            >
              <DollarSign size={20} />
              {!sidebarCollapsed && <span>Loan Calculator</span>}
            </div>

            <div
              className={`sidebar-nav-item ${currentPage === 'documents' ? 'active' : ''}`}
              onClick={() => setCurrentPage('documents')}
            >
              <FileCheck size={20} />
              {!sidebarCollapsed && <span>Documents</span>}
            </div>

            <div
              className={`sidebar-nav-item ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentPage('profile')}
            >
              <User size={20} />
              {!sidebarCollapsed && <span>Profile</span>}
            </div>

            <div
              className={`sidebar-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('settings')}
            >
              <Settings size={20} />
              {!sidebarCollapsed && <span>Settings</span>}
            </div>
          </nav>

          <div style={{ padding: '1rem 0', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
            <div
              className="sidebar-nav-item"
              onClick={logout}
              style={{ color: '#ef4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Logout</span>}
            </div>
          </div>
        </div>

        <div style={{
          ...contentAreaStyle,
          marginLeft: sidebarCollapsed ? '1rem' : '1rem'
        }}>
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
}

// Kubera Green Theme Styles
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

// Add CSS animation for spinner
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject CSS animation
if (!document.querySelector('#spin-animation')) {
  const style = document.createElement('style');
  style.id = 'spin-animation';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const headerStyle = {
  backgroundColor: '#22c55e',
  color: 'white',
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const logoSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const logoStyle = {
  width: '48px',
  height: '48px',
  backgroundColor: 'white',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  margin: 0
};

const subtitleStyle = {
  fontSize: '0.875rem',
  opacity: 0.9,
  margin: 0
};

const userInfoStyle = {
  textAlign: 'right',
  fontSize: '0.875rem'
};

const mainContentStyle = {
  display: 'flex',
  minHeight: 'calc(100vh - 80px)',
  backgroundColor: '#f8fafc'
};

const breadcrumbStyle = {
  fontSize: '1.125rem',
  fontWeight: 'bold',
  color: '#22c55e',
  marginBottom: '2rem'
};

const progressBarContainerStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  padding: '2rem',
  marginBottom: '2rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const progressHeaderStyle = {
  textAlign: 'center',
  marginBottom: '2rem'
};

const progressTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#22c55e',
  margin: 0
};

const progressSubtitleStyle = {
  fontSize: '0.875rem',
  color: '#64748b',
  margin: '0.5rem 0 0 0'
};

const stepsRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  flexWrap: 'wrap'
};

const stepCircleContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '8px',
  transition: 'background-color 0.2s'
};

const activeStepCircleStyle = {
  backgroundColor: '#f0fdf4'
};

const completedStepCircleStyle = {
  backgroundColor: '#f0fdf4'
};

const stepCircleStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.5rem',
  border: '2px solid #e2e8f0',
  transition: 'all 0.2s'
};

const stepNumberStyle = {
  fontSize: '0.875rem',
  fontWeight: 'bold',
  color: '#64748b'
};

const stepLabelContainerStyle = {
  textAlign: 'center',
  maxWidth: '80px'
};

const stepTitleStyle = {
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: '#22c55e',
  marginBottom: '0.25rem'
};

const stepDescriptionStyle = {
  fontSize: '0.625rem',
  color: '#64748b',
  lineHeight: 1.2
};

const stepConnectorStyle = {
  width: '30px',
  height: '2px',
  backgroundColor: '#e2e8f0',
  margin: '0 0.25rem'
};

const helpTextStyle = {
  marginBottom: '2rem',
  fontSize: '0.875rem',
  color: '#64748b'
};

const formContainerStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  marginBottom: '2rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const formHeaderStyle = {
  backgroundColor: '#f8fafc',
  padding: '1.5rem',
  borderBottom: '1px solid #e2e8f0',
  borderRadius: '1rem 1rem 0 0'
};

const formTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: '#22c55e',
  margin: 0
};

const formSubtitleStyle = {
  fontSize: '0.875rem',
  color: '#64748b',
  margin: '0.5rem 0 0 0'
};

const formContentStyle = {
  padding: '2rem'
};

const noteBoxStyle = {
  display: 'flex',
  gap: '0.75rem',
  padding: '1rem',
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '0.5rem',
  marginBottom: '1.5rem',
  fontSize: '0.875rem'
};

const noteListStyle = {
  margin: '0.5rem 0 0 0',
  paddingLeft: '1rem'
};

const fieldGroupStyle = {
  marginBottom: '1rem'
};

const fieldRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  marginBottom: '1rem'
};

const fieldLabelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  color: '#374151',
  marginBottom: '0.5rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  ':focus': {
    borderColor: '#22c55e'
  }
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer'
};

const radioGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
};

const radioGroupHorizontalStyle = {
  display: 'flex',
  gap: '1.5rem'
};

const radioOptionStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  padding: '1rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    borderColor: '#22c55e',
    backgroundColor: '#f8fafc'
  }
};

const radioOptionHorizontalStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer'
};

const radioInputStyle = {
  margin: 0
};

const radioContentStyle = {
  flex: 1
};

const radioLabelStyle = {
  fontSize: '0.875rem',
  fontWeight: 'bold',
  color: '#374151',
  marginBottom: '0.25rem'
};

const radioDescStyle = {
  fontSize: '0.75rem',
  color: '#64748b'
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#22c55e',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #e2e8f0'
};

const errorMessageStyle = {
  fontSize: '0.75rem',
  color: '#dc2626',
  marginTop: '0.25rem'
};

const navigationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '2rem',
  borderTop: '1px solid #e2e8f0'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem'
};

const navButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const saveButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.5rem',
  backgroundColor: '#f59e0b',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const nextButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const sidebarStyle = {
  width: '280px',
  backgroundColor: 'white',
  borderRight: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
};

const sidebarHeaderStyle = {
  padding: '2rem 1.5rem',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const sidebarLogoStyle = {
  width: '48px',
  height: '48px',
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const sidebarTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#22c55e',
  margin: 0
};

const sidebarSubtitleStyle = {
  fontSize: '0.875rem',
  color: '#64748b',
  margin: 0
};

const sidebarNavStyle = {
  flex: 1,
  padding: '1rem 0'
};

const sidebarMenuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem 1.5rem',
  color: '#64748b',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '0.875rem',
  fontWeight: '500',
  ':hover': {
    backgroundColor: '#f8fafc',
    color: '#22c55e'
  }
};

const sidebarFooterStyle = {
  padding: '1rem 0',
  borderTop: '1px solid #e2e8f0'
};

const contentAreaStyle = {
  flex: 1,
  padding: '2rem',
  backgroundColor: 'white',
  margin: '2rem',
  marginLeft: '1rem',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

export default StudentDocumentsUpload;