import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  FileText, 
  Users, 
  Eye, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Star
} from "lucide-react";

interface JobsTabProps {
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  demoMode?: boolean;
}

const JobsTab: React.FC<JobsTabProps> = ({ verificationStatus = 'pending', demoMode = false }) => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'active' | 'draft' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    transport: '',
    accommodation: '',
    meals: '',
    jobType: '', // short-term or long-term
    paymentUnit: '', // per-patient or per-hour (for short-term)
    paymentAmount: '',
    startDate: '',
    endDate: '',
    shiftStartTime: '',
    shiftEndTime: '',
    qualifications: [] as string[],
    skills: [] as string[],
    experience: '',
  });

  // Demo job data
  const demoJobs = [
    {
      id: 1,
      title: 'Registered Nurse - ICU',
      department: 'Intensive Care Unit',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$75,000 - $90,000',
      status: 'active',
      applications: 12,
      views: 156,
      posted: '2024-01-15',
      deadline: '2024-02-15'
    },
    {
      id: 2,
      title: 'Physical Therapist',
      department: 'Rehabilitation',
      location: 'Los Angeles, CA',
      type: 'Part-time',
      salary: '$35 - $45/hour',
      status: 'active',
      applications: 8,
      views: 89,
      posted: '2024-01-10',
      deadline: '2024-02-10'
    },
    {
      id: 3,
      title: 'Medical Technologist',
      department: 'Laboratory',
      location: 'Chicago, IL',
      type: 'Full-time',
      salary: '$55,000 - $70,000',
      status: 'draft',
      applications: 0,
      views: 0,
      posted: '2024-01-20',
      deadline: '2024-02-20'
    }
  ];

  const isAccessible = verificationStatus === 'verified' || demoMode;

  // Qualifications options
  const qualifications = [
    'BAMS', 'BA Psychology', 'BASLP', 'BBA Hospital Management', 'BDS', 'BE Biomedical Engineering', 'BHA', 'BHMS', 'BNYS', 'BOptom', 'BPH', 'BPharm', 'BPO', 'BPT',
    'BSc Anaesthesia Technology', 'BSc Audiology and Speech Language Pathology', 'BSc Biochemistry', 'BSc Biomedical Science', 'BSc Biotechnology', 'BSc Cardiac Care Technology',
    'BSc Cardio Pulmonary Technology', 'BSc Cath Lab Technology', 'BSc Clinical Nutrition and Dietetics', 'BSc Clinical Psychology', 'BSc Critical Care Technology',
    'BSc Dialysis Technology', 'BSc Emergency and Trauma Care Technology', 'BSc Emergency Medical Technology', 'BSc Food and Nutrition', 'BSc Genetics',
    'BSc Health Information Management', 'BSc Medical Imaging Technology', 'BSc Medical Laboratory Technology', 'BSc Medical Microbiology', 'BSc Neurophysiology Technology',
    'BSc Nuclear Medicine Technology', 'BSc Nursing', 'BSc Nutrition and Dietetics', 'BSc Operation Theatre Technology', 'BSc Optometry', 'BSc Perfusion Technology',
    'BSc Physician Assistant', 'BSc Radiography and Imaging Technology', 'BSc Radiotherapy Technology', 'BSc Respiratory Therapy', 'BSc Speech and Hearing',
    'BSc Trauma Care Management', 'BSMS', 'BSW', 'BTech Biomedical Engineering', 'BTech Biotechnology', 'DM Addiction Psychiatry', 'DM Cardiology', 'DM Clinical Haematology',
    'DM Clinical Immunology and Rheumatology', 'DM Endocrinology', 'DM Gastroenterology', 'DM Hepatology', 'DM Infectious Diseases', 'DM Interventional Radiology',
    'DM Medical Genetics', 'DM Medical Oncology', 'DM Neonatology', 'DM Nephrology', 'DM Neurology', 'DM Paediatric Cardiology', 'DM Paediatric Neurology',
    'DM Pulmonary Critical Care and Sleep Medicine', 'DM Pulmonary Medicine', 'DM Rheumatology', 'DNB Broad Specialty', 'DrNB Super Specialty', 'MBA Hospital Administration',
    'MBA Hospital and Healthcare Management', 'MBBS', 'MCh Cardiothoracic and Vascular Surgery', 'MCh Endocrine Surgery', 'MCh Hand Surgery', 'MCh Head and Neck Surgery',
    'MCh Neurosurgery', 'MCh Paediatric Surgery', 'MCh Plastic and Reconstructive Surgery', 'MCh Surgical Gastroenterology', 'MCh Surgical Oncology', 'MCh Thoracic Surgery',
    'MCh Urology', 'MCh Vascular Surgery', 'MD Anaesthesiology', 'MD Anatomy', 'MD Ayurveda', 'MD Biochemistry', 'MD Community Medicine', 'MD Dermatology Venereology and Leprosy',
    'MD Emergency Medicine', 'MD Family Medicine', 'MD Forensic Medicine', 'MD General Medicine', 'MD Geriatrics', 'MD Homoeopathy', 'MD Hospital Administration',
    'MD Immunohematology and Transfusion Medicine', 'MD Laboratory Medicine', 'MD Medical Genetics', 'MD Microbiology', 'MD Nuclear Medicine', 'MD Obstetrics and Gynaecology',
    'MD Paediatrics', 'MD Palliative Medicine', 'MD Pathology', 'MD Pharmacology', 'MD Physical Medicine and Rehabilitation', 'MD Physiology', 'MD Psychiatry',
    'MD Radiodiagnosis', 'MD Radiotherapy', 'MD Respiratory Medicine', 'MDS Conservative Dentistry and Endodontics', 'MD Siddha', 'MDS Oral and Maxillofacial Surgery',
    'MDS Oral Medicine and Radiology', 'MDS Oral Pathology and Microbiology', 'MDS Orthodontics and Dentofacial Orthopaedics', 'MDS Pedodontics and Preventive Dentistry',
    'MDS Periodontology', 'MD Sports Medicine', 'MDS Prosthodontics and Crown and Bridge', 'MDS Public Health Dentistry', 'MD Tropical Medicine', 'MD Unani', 'MD Yoga',
    'MHA', 'MHM', 'MOptom', 'MPH', 'MPhil Clinical Psychology', 'MPhil Psychiatric Social Work', 'MPhil Rehabilitation Psychology', 'MPO', 'MPT Cardiorespiratory Physiotherapy',
    'MPT Community Health Physiotherapy', 'MPT Musculoskeletal Physiotherapy', 'MPT Neurology Physiotherapy', 'MPT Paediatrics Physiotherapy', 'MPT Sports Physiotherapy',
    'MSc Anatomy', 'MSc Audiology', 'MSc Biochemistry', 'MSc Biomedical Engineering', 'MSc Biomedical Science', 'MSc Biostatistics', 'MSc Biotechnology', 'MSc Clinical Nutrition',
    'MSc Clinical Psychology', 'MSc Clinical Research', 'MSc Dietetics and Food Service Management', 'MSc Epidemiology', 'MSc Food Science and Nutrition', 'MSc Genetic Counseling',
    'MSc Genetics', 'MSc Health Data Science', 'MSc Health Economics', 'MSc Health Informatics', 'MSc Medical Biochemistry', 'MSc Medical Biotechnology', 'MSc Medical Genetics',
    'MSc Medical Imaging Technology', 'MSc Medical Laboratory Technology', 'MSc Medical Microbiology', 'MSc Medical Physics', 'MSc Medical Physiology', 'MSc Microbiology',
    'MSc Neuroscience', 'MSc Nuclear Medicine Technology', 'MSc Nutrition and Dietetics', 'MSc Optometry', 'MSc Perfusion Technology', 'MSc Physiology',
    'MSc Radiography and Imaging Technology', 'MSc Radiological Physics', 'MSc Radiotherapy Technology', 'MSc Rehabilitation Psychology', 'MSc Respiratory Therapy',
    'MSc Speech Language Pathology', 'MS General Surgery', 'MS Obstetrics and Gynaecology', 'MS Ophthalmology', 'MS Orthopaedics', 'MS Otorhinolaryngology',
    'MSW Medical and Psychiatric Social Work', 'MTech Biomedical Engineering', 'MTech Biotechnology', 'PharmD', 'PhD Biochemistry', 'PhD Biomedical Engineering',
    'PhD Biotechnology', 'PhD Clinical Psychology', 'PhD Epidemiology', 'PhD Hospital Administration', 'PhD Medical Biotechnology', 'PhD Medical Microbiology',
    'PhD Medical Physics', 'PhD Nursing', 'PhD Pharmacy', 'PhD Physiology', 'PhD Public Health', 'Post Basic BSc Nursing', 'PsyD Clinical Psychology'
  ];

  // Skills options (sample - the full list would be very long)
  const skillsOptions = [
    'abdominal examination', 'arterial blood gas interpretation', 'basic life support', 'blood pressure monitoring', 'cardiac monitoring',
    'catheter insertion', 'CPR', 'ECG interpretation', 'emergency response', 'infection control', 'IV insertion', 'medication administration',
    'patient assessment', 'patient care', 'patient education', 'pulse oximetry', 'respiratory assessment', 'vital signs monitoring',
    'wound care', 'zygomatic arch fracture reduction closed'
  ];
  if (!isAccessible) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your job postings to attract healthcare professionals.
          </p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Verification Required</CardTitle>
            <CardDescription className="text-yellow-700">
              You need to complete institution verification before you can post jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              Complete Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job posted:', jobFormData);
    setShowJobForm(false);
    setJobFormData({
      title: '',
      description: '',
      transport: '',
      accommodation: '',
      meals: '',
      jobType: '',
      paymentUnit: '',
      paymentAmount: '',
      startDate: '',
      endDate: '',
      shiftStartTime: '',
      shiftEndTime: '',
      qualifications: [],
      skills: [],
      experience: '',
    });
  };

  const filteredJobs = demoJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesView = activeView === 'all' || job.status === activeView;
    return matchesSearch && matchesView;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your job postings to attract healthcare professionals.
          </p>
          {demoMode && (
            <Badge className="mt-2 bg-amber-100 text-amber-800">Demo Mode - Sample Data</Badge>
          )}
        </div>
        <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post a New Job</DialogTitle>
              <DialogDescription>
                Create a new job posting to attract qualified healthcare professionals.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleJobSubmit} className="space-y-8">
              {/* Job Title and Description Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">JOB POST TITLE AND DESCRIPTION</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please provide a suitable title and detailed description of the job role, responsibilities, and expectations.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Registered Nurse - ICU"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role, responsibilities, and expectations..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Will transport be provided for the candidate? *</Label>
                    <Select onValueChange={(value) => setJobFormData(prev => ({ ...prev, transport: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Will accommodation be provided for the candidate? *</Label>
                    <Select onValueChange={(value) => setJobFormData(prev => ({ ...prev, accommodation: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Will meals be provided for the candidate? *</Label>
                    <Select onValueChange={(value) => setJobFormData(prev => ({ ...prev, meals: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Job Type Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">JOB TYPE</h3>
                <div className="space-y-2">
                  <Label>Is this position a Short-Term Hire or a Long-Term Hire? *</Label>
                  <Select onValueChange={(value) => setJobFormData(prev => ({ ...prev, jobType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short-term">Short-Term Hire</SelectItem>
                      <SelectItem value="long-term">Long-Term Hire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Section - Only for Short Term */}
              {jobFormData.jobType === 'short-term' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SHORT TERM HIRE PAYMENT</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>What is the preferred unit of payment for this role? *</Label>
                      <Select onValueChange={(value) => setJobFormData(prev => ({ ...prev, paymentUnit: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per-patient">Per Patient</SelectItem>
                          <SelectItem value="per-hour">Per Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paymentAmount">What is the payment amount for the selected pay unit? (in Rupees) *</Label>
                      <Input
                        id="paymentAmount"
                        type="number"
                        value={jobFormData.paymentAmount}
                        onChange={(e) => setJobFormData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                        placeholder="Enter amount"
                        required={jobFormData.jobType === 'short-term'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Work Duration and Schedule */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">WORK DURATION AND SCHEDULE</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please provide the details of the job schedule, including the shift timings and overall duration of the role.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={jobFormData.startDate}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={jobFormData.endDate}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shiftStartTime">Shift Start Time *</Label>
                    <Input
                      id="shiftStartTime"
                      type="time"
                      value={jobFormData.shiftStartTime}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, shiftStartTime: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shiftEndTime">Shift End Time *</Label>
                    <Input
                      id="shiftEndTime"
                      type="time"
                      value={jobFormData.shiftEndTime}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, shiftEndTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Job Criteria Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">JOB CRITERIA</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please specify the qualifications, skills, and experience required for this position. The details you provide will help us ensure that only suitable candidates are matched to your job posting.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Which qualifications are acceptable for this position? *</Label>
                    <p className="text-xs text-muted-foreground">(Please select all that apply)</p>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {qualifications.map((qual) => (
                          <label key={qual} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={jobFormData.qualifications.includes(qual)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setJobFormData(prev => ({
                                    ...prev,
                                    qualifications: [...prev.qualifications, qual]
                                  }));
                                } else {
                                  setJobFormData(prev => ({
                                    ...prev,
                                    qualifications: prev.qualifications.filter(q => q !== qual)
                                  }));
                                }
                              }}
                            />
                            <span>{qual}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Which skills are required for this position? *</Label>
                    <p className="text-xs text-muted-foreground">(Please select all that apply)</p>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {skillsOptions.map((skill) => (
                          <label key={skill} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={jobFormData.skills.includes(skill)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setJobFormData(prev => ({
                                    ...prev,
                                    skills: [...prev.skills, skill]
                                  }));
                                } else {
                                  setJobFormData(prev => ({
                                    ...prev,
                                    skills: prev.skills.filter(s => s !== skill)
                                  }));
                                }
                              }}
                            />
                            <span>{skill}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">What is the minimum number of years of experience required for this role? *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={jobFormData.experience}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Enter minimum years of experience"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowJobForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Post Job
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoJobs.filter(j => j.status === 'active').length : 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoJobs.reduce((sum, job) => sum + job.applications, 0) : 0}</div>
            <p className="text-xs text-muted-foreground">All applications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoJobs.reduce((sum, job) => sum + job.views, 0) : 0}</div>
            <p className="text-xs text-muted-foreground">Job views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Jobs</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoJobs.filter(j => j.status === 'draft').length : 0}</div>
            <p className="text-xs text-muted-foreground">Pending publication</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {demoMode && filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Posted {job.posted}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{job.applications}</span>
                        <span className="text-muted-foreground">applications</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{job.views}</span>
                        <span className="text-muted-foreground">views</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No job postings yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first job posting to start attracting healthcare professionals to your institution.
              </p>
              <Button onClick={() => setShowJobForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Job
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobsTab;
