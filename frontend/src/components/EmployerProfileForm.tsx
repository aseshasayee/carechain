import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  // Representative Details
  firstName: string;
  lastName: string;
  email: string;
  aadhaarNo: string;
  aadhaarFile: File | null;
  contactNo: string;
  
  // Institution Details
  institutionName: string;
  institutionType: string;
  otherInstitutionType: string;
  fullAddress: string;
  pincode: string;
  website: string;
  specialities: string[];
  otherSpeciality: string;
  
  // Facilities
  hasOutpatient: string;
  hasInpatient: string;
  inpatientBeds: string;
  hasEmergency: string;
  emergencyBeds: string;
  hasICU: string;
  icuBeds: string;
  hasNICU: string;
  nicuBeds: string;
  hasOperationTheatres: string;
  operationTheatresCount: string;
  hasDiagnosticLab: string;
  diagnosticFacilities: string[];
  otherDiagnostic: string;
  hasRadiology: string;
  imagingFacilities: string[];
  otherImaging: string;
  hasPharmacy: string;
  hasSecurity: string;
  
  // Workforce
  totalDoctors: string;
  totalNurses: string;
  
  // Uploads
  facilityImages: File[];
  
  // Documentation
  hasRegistration: string;
  registrationFiles: File[];
  hasInfrastructure: string;
  infrastructureFiles: File[];
  hasQuality: string;
  qualityFiles: File[];
  hasOtherDocs: string;
  otherDocsFiles: File[];
}

const EmployerProfileForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    aadhaarNo: '',
    aadhaarFile: null,
    contactNo: '',
    institutionName: '',
    institutionType: '',
    otherInstitutionType: '',
    fullAddress: '',
    pincode: '',
    website: '',
    specialities: [],
    otherSpeciality: '',
    hasOutpatient: '',
    hasInpatient: '',
    inpatientBeds: '',
    hasEmergency: '',
    emergencyBeds: '',
    hasICU: '',
    icuBeds: '',
    hasNICU: '',
    nicuBeds: '',
    hasOperationTheatres: '',
    operationTheatresCount: '',
    hasDiagnosticLab: '',
    diagnosticFacilities: [],
    otherDiagnostic: '',
    hasRadiology: '',
    imagingFacilities: [],
    otherImaging: '',
    hasPharmacy: '',
    hasSecurity: '',
    totalDoctors: '',
    totalNurses: '',
    facilityImages: [],
    hasRegistration: '',
    registrationFiles: [],
    hasInfrastructure: '',
    infrastructureFiles: [],
    hasQuality: '',
    qualityFiles: [],
    hasOtherDocs: '',
    otherDocsFiles: []
  });

  const totalSteps = 9;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    'Institution Representative Details',
    'Institution Details', 
    'Specialities',
    'Facilities - Basic',
    'Facilities - Advanced',
    'Workforce',
    'Facility Images',
    'Registration & Licenses',
    'Final Documentation'
  ];

  const institutionTypes = [
    'Clinic',
    'Diagnostic Lab', 
    'Hospital',
    'Pharmacy',
    'Radiology Centre',
    'Other'
  ];

  const specialities = [
    'Anesthesiology', 'Audiology and Speech Pathology', 'Biomedical Engineering',
    'Cardiology', 'Cardiothoracic and Vascular Surgery(CTVS)', 'Clinical Biochemistry',
    'Clinical Psychology', 'Cosmetology', 'Critical Care Medicine', 'De-Addiction Services',
    'Dentistry and Oral Surgery', 'Dermatology', 'Emergency Medicine', 'Endocrinology',
    'ENT/Otolaryngology', 'Fetal Medicine', 'Gastroenterology', 'Gastrointestinal Surgery',
    'General Medicine', 'General Pediatrics', 'General Surgery', 'Geriatrics',
    'Gynaecology', 'Hematology', 'Hepatology', 'Immunology', 'Infectious Diseases',
    'Interventional Radiology', 'Maxillofacial Surgery', 'Medical Oncology',
    'Microbiology', 'Neonatology', 'Nephrology', 'Neurology', 'Neurosurgery',
    'Nursing Services', 'Nutrition and Dietetics', 'Obstetrics', 'Occupational Therapy',
    'Ophthalmology', 'Orthopaedics', 'Pain Medicine', 'Palliative Care', 'Pathology',
    'Pediatric Cardiology', 'Pediatric Nephrology', 'Pediatric Neurology', 'Pediatric Oncology',
    'Pediatric Surgery', 'Pharmacy', 'Physiotherapy and Rehabilitation Medicine',
    'Plastic and Reconstructive Surgery', 'Psychiatry', 'Pulmonology', 'Radiation Oncology',
    'Radiology', 'Reproductive Medicine', 'Rheumatology', 'Sleep Medicine', 'Speech Therapy',
    'Sports Medicine', 'Surgical Oncology', 'Transfusion Medicine', 'Transplant Surgery',
    'Trauma Surgery', 'Urology', 'Venereology', 'Other'
  ];

  const diagnosticFacilities = [
    'Blood Bank', 'Clinical Biochemistry', 'Clinical Pathology', 'Hematology',
    'Histopathology', 'Immunology and Serology', 'Microbiology', 
    'Molecular Diagnostics & Genetics', 'Other'
  ];

  const imagingFacilities = [
    'Bone Densitometry (DEXA Scan)', 'Cardiac Imaging', 'Computed Tomography',
    'Conventional X-ray', 'Digital Radiography', 'Fluoroscopy', 
    'Magnetic Resonance Angiography', 'Magnetic Resonance Cholangiopancreatography (MRCP)',
    'Magnetic Resonance Imaging (MRI)', 'Mammography', 'Nuclear Medicine Imaging',
    'PET-CT', 'PET-MRI', 'Portable Ultrasound', 'Portable X-ray', 'Ultrasound (2D,3D,4D)',
    'Ultrasound Color Doppler', 'Ultrasound Elastography', 'Other'
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleFileUpload = (field: keyof FormData, files: FileList | null) => {
    if (files) {
      if (field === 'aadhaarFile') {
        handleInputChange(field, files[0]);
      } else {
        const fileArray = Array.from(files);
        handleInputChange(field, fileArray);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Profile Submitted Successfully!",
      description: "Your employer profile has been submitted for review.",
    });
    console.log('Form Data:', formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Registered Email ID *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="aadhaarNo">Aadhaar Card No. *</Label>
              <Input
                id="aadhaarNo"
                value={formData.aadhaarNo}
                onChange={(e) => handleInputChange('aadhaarNo', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="aadhaarFile">Aadhaar Card Photo * (PDF, Max 10MB)</Label>
              <Input
                id="aadhaarFile"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('aadhaarFile', e.target.files)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactNo">Contact No. *</Label>
              <Input
                id="contactNo"
                value={formData.contactNo}
                onChange={(e) => handleInputChange('contactNo', e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="institutionName">Institution Name *</Label>
              <Input
                id="institutionName"
                value={formData.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Type of Institution *</Label>
              <Select value={formData.institutionType} onValueChange={(value) => handleInputChange('institutionType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  {institutionTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.institutionType === 'Other' && (
                <Input
                  className="mt-2"
                  placeholder="Please specify"
                  value={formData.otherInstitutionType}
                  onChange={(e) => handleInputChange('otherInstitutionType', e.target.value)}
                />
              )}
            </div>
            <div>
              <Label htmlFor="fullAddress">Full Address *</Label>
              <Textarea
                id="fullAddress"
                value={formData.fullAddress}
                onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Label>List the specialities offered at your Institution *</Label>
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto border rounded-lg p-4">
              {specialities.map((speciality) => (
                <div key={speciality} className="flex items-center space-x-2">
                  <Checkbox
                    id={speciality}
                    checked={formData.specialities.includes(speciality)}
                    onCheckedChange={(checked) => handleArrayChange('specialities', speciality, checked as boolean)}
                  />
                  <Label htmlFor={speciality} className="text-sm">{speciality}</Label>
                </div>
              ))}
            </div>
            {formData.specialities.includes('Other') && (
              <Input
                placeholder="Please specify other speciality"
                value={formData.otherSpeciality}
                onChange={(e) => handleInputChange('otherSpeciality', e.target.value)}
              />
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Do you have outpatient clinics? *</Label>
              <RadioGroup value={formData.hasOutpatient} onValueChange={(value) => handleInputChange('hasOutpatient', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="outpatient-yes" />
                  <Label htmlFor="outpatient-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="outpatient-no" />
                  <Label htmlFor="outpatient-no">No</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label>Do you have in-patient facilities? *</Label>
              <RadioGroup value={formData.hasInpatient} onValueChange={(value) => handleInputChange('hasInpatient', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="inpatient-yes" />
                  <Label htmlFor="inpatient-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="inpatient-no" />
                  <Label htmlFor="inpatient-no">No</Label>
                </div>
              </RadioGroup>
              {formData.hasInpatient === 'yes' && (
                <Input
                  className="mt-2"
                  placeholder="Total number of in-patient beds"
                  value={formData.inpatientBeds}
                  onChange={(e) => handleInputChange('inpatientBeds', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Do you have an emergency room? *</Label>
              <RadioGroup value={formData.hasEmergency} onValueChange={(value) => handleInputChange('hasEmergency', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="emergency-yes" />
                  <Label htmlFor="emergency-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="emergency-no" />
                  <Label htmlFor="emergency-no">No</Label>
                </div>
              </RadioGroup>
              {formData.hasEmergency === 'yes' && (
                <Input
                  className="mt-2"
                  placeholder="Total number of emergency beds"
                  value={formData.emergencyBeds}
                  onChange={(e) => handleInputChange('emergencyBeds', e.target.value)}
                />
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>Do you have ICU Facilities? *</Label>
              <RadioGroup value={formData.hasICU} onValueChange={(value) => handleInputChange('hasICU', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="icu-yes" />
                  <Label htmlFor="icu-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="icu-no" />
                  <Label htmlFor="icu-no">No</Label>
                </div>
              </RadioGroup>
              {formData.hasICU === 'yes' && (
                <Input
                  className="mt-2"
                  placeholder="Total number of ICU beds"
                  value={formData.icuBeds}
                  onChange={(e) => handleInputChange('icuBeds', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Do you have NICU/PICU facilities? *</Label>
              <RadioGroup value={formData.hasNICU} onValueChange={(value) => handleInputChange('hasNICU', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="nicu-yes" />
                  <Label htmlFor="nicu-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="nicu-no" />
                  <Label htmlFor="nicu-no">No</Label>
                </div>
              </RadioGroup>
              {formData.hasNICU === 'yes' && (
                <Input
                  className="mt-2"
                  placeholder="Total number of NICU/PICU beds"
                  value={formData.nicuBeds}
                  onChange={(e) => handleInputChange('nicuBeds', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Do you have operation theatres? *</Label>
              <RadioGroup value={formData.hasOperationTheatres} onValueChange={(value) => handleInputChange('hasOperationTheatres', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="ot-yes" />
                  <Label htmlFor="ot-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="ot-no" />
                  <Label htmlFor="ot-no">No</Label>
                </div>
              </RadioGroup>
              {formData.hasOperationTheatres === 'yes' && (
                <Input
                  className="mt-2"
                  placeholder="Total number of operation theatres"
                  value={formData.operationTheatresCount}
                  onChange={(e) => handleInputChange('operationTheatresCount', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Do you have Diagnostic Lab Facilities? *</Label>
              <RadioGroup value={formData.hasDiagnosticLab} onValueChange={(value) => handleInputChange('hasDiagnosticLab', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="lab-yes" />
                  <Label htmlFor="lab-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="lab-no" />
                  <Label htmlFor="lab-no">No</Label>
                </div>
              </RadioGroup>
              {formData.hasDiagnosticLab === 'yes' && (
                <div className="space-y-2">
                  <Label>Diagnostic facilities available:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {diagnosticFacilities.map((facility) => (
                      <div key={facility} className="flex items-center space-x-2">
                        <Checkbox
                          id={facility}
                          checked={formData.diagnosticFacilities.includes(facility)}
                          onCheckedChange={(checked) => handleArrayChange('diagnosticFacilities', facility, checked as boolean)}
                        />
                        <Label htmlFor={facility} className="text-sm">{facility}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.diagnosticFacilities.includes('Other') && (
                    <Input
                      placeholder="Please specify other diagnostic facilities"
                      value={formData.otherDiagnostic}
                      onChange={(e) => handleInputChange('otherDiagnostic', e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Do you have a radiology department? *</Label>
              <RadioGroup value={formData.hasRadiology} onValueChange={(value) => handleInputChange('hasRadiology', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="radio-yes" />
                  <Label htmlFor="radio-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="radio-no" />
                  <Label htmlFor="radio-no">No</Label>
                </div>
              </RadioGroup>
              {formData.hasRadiology === 'yes' && (
                <div className="space-y-2">
                  <Label>Imaging facilities available:</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {imagingFacilities.map((facility) => (
                      <div key={facility} className="flex items-center space-x-2">
                        <Checkbox
                          id={facility}
                          checked={formData.imagingFacilities.includes(facility)}
                          onCheckedChange={(checked) => handleArrayChange('imagingFacilities', facility, checked as boolean)}
                        />
                        <Label htmlFor={facility} className="text-sm">{facility}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.imagingFacilities.includes('Other') && (
                    <Input
                      placeholder="Please specify other imaging facilities"
                      value={formData.otherImaging}
                      onChange={(e) => handleInputChange('otherImaging', e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Do you have a pharmacy? *</Label>
                <RadioGroup value={formData.hasPharmacy} onValueChange={(value) => handleInputChange('hasPharmacy', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pharmacy-yes" />
                    <Label htmlFor="pharmacy-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pharmacy-no" />
                    <Label htmlFor="pharmacy-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>Do you have security personnel? *</Label>
                <RadioGroup value={formData.hasSecurity} onValueChange={(value) => handleInputChange('hasSecurity', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="security-yes" />
                    <Label htmlFor="security-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="security-no" />
                    <Label htmlFor="security-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="totalDoctors">Give the total number of doctors employed currently *</Label>
              <Input
                id="totalDoctors"
                type="number"
                value={formData.totalDoctors}
                onChange={(e) => handleInputChange('totalDoctors', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="totalNurses">Give the total number of nurses employed currently *</Label>
              <Input
                id="totalNurses"
                type="number"
                value={formData.totalNurses}
                onChange={(e) => handleInputChange('totalNurses', e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div>
              <Label>Upload Images of your facility</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Please upload a few images of your facility. These will help prospective candidates gain a clear understanding of your workplace environment and make more informed decisions.
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload('facilityImages', e.target.files)}
              />
              <p className="text-xs text-muted-foreground">Upload up to 10 images. Max 10MB per file.</p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <Label>Do you have any Registration and Licenses (Clinical Establishment Registration, Pharmacy License, etc.)? *</Label>
              <RadioGroup value={formData.hasRegistration} onValueChange={(value) => handleInputChange('hasRegistration', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="registration-available" />
                  <Label htmlFor="registration-available">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-available" id="registration-not-available" />
                  <Label htmlFor="registration-not-available">Not Available</Label>
                </div>
              </RadioGroup>
              {formData.hasRegistration === 'available' && (
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileUpload('registrationFiles', e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">Upload up to 5 PDF files. Max 10MB per file.</p>
                </div>
              )}
            </div>

            <div>
              <Label>Do you have any Infrastructure and Operational Clearances (Building approvals, Biomedical waste management authorization, etc.) *</Label>
              <RadioGroup value={formData.hasInfrastructure} onValueChange={(value) => handleInputChange('hasInfrastructure', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="infrastructure-available" />
                  <Label htmlFor="infrastructure-available">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-available" id="infrastructure-not-available" />
                  <Label htmlFor="infrastructure-not-available">Not Available</Label>
                </div>
              </RadioGroup>
              {formData.hasInfrastructure === 'available' && (
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileUpload('infrastructureFiles', e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">Upload up to 5 PDF files. Max 10MB per file.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <Label>Do you have any Quality and Accreditation Standards (NABH, NABL, ISO, etc.) *</Label>
              <RadioGroup value={formData.hasQuality} onValueChange={(value) => handleInputChange('hasQuality', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="quality-available" />
                  <Label htmlFor="quality-available">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-available" id="quality-not-available" />
                  <Label htmlFor="quality-not-available">Not Available</Label>
                </div>
              </RadioGroup>
              {formData.hasQuality === 'available' && (
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileUpload('qualityFiles', e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">Upload up to 5 PDF files. Max 10MB per file.</p>
                </div>
              )}
            </div>

            <div>
              <Label>Do you have any Other Documentation for Verification *</Label>
              <RadioGroup value={formData.hasOtherDocs} onValueChange={(value) => handleInputChange('hasOtherDocs', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="other-available" />
                  <Label htmlFor="other-available">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-available" id="other-not-available" />
                  <Label htmlFor="other-not-available">Not Available</Label>
                </div>
              </RadioGroup>
              {formData.hasOtherDocs === 'available' && (
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileUpload('otherDocsFiles', e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">Upload up to 5 PDF files. Max 10MB per file.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Employer Profile Form</CardTitle>
                <CardDescription>Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</CardDescription>
              </div>
              <Badge variant="secondary">{Math.round(progress)}% Complete</Badge>
            </div>
            <Progress value={progress} className="mb-4" />
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px]">
              {renderStep()}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === totalSteps ? (
                <Button onClick={handleSubmit}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Profile
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerProfileForm;