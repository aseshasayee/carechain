import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  MessageCircle, 
  Star,
  Download,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from "lucide-react";

interface CandidatesTabProps {
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  demoMode?: boolean;
}

const CandidatesTab: React.FC<CandidatesTabProps> = ({ verificationStatus = 'pending', demoMode = false }) => {
  const [activeView, setActiveView] = useState<'all' | 'pending' | 'shortlisted' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Demo candidates data
  const demoCandidates = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      avatar: '/placeholder-avatar.jpg',
      title: 'Registered Nurse',
      experience: '5 years',
      education: 'BSN, Johns Hopkins University',
      location: 'New York, NY',
      appliedFor: 'Registered Nurse - ICU',
      jobId: 1,
      appliedDate: '2024-01-18',
      status: 'pending',
      rating: 4.8,
      certifications: ['RN License', 'BLS', 'ACLS', 'PALS'],
      skills: ['Critical Care', 'Patient Assessment', 'Medication Administration', 'Emergency Response'],
      summary: 'Experienced ICU nurse with strong critical care skills and excellent patient care record.',
      resumeUrl: '/resumes/sarah-johnson.pdf'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      avatar: '/placeholder-avatar.jpg',
      title: 'Physical Therapist',
      experience: '3 years',
      education: 'DPT, University of Southern California',
      location: 'Los Angeles, CA',
      appliedFor: 'Physical Therapist',
      jobId: 2,
      appliedDate: '2024-01-16',
      status: 'shortlisted',
      rating: 4.6,
      certifications: ['PT License', 'Orthopedic Specialist'],
      skills: ['Manual Therapy', 'Exercise Prescription', 'Patient Education', 'Injury Prevention'],
      summary: 'Dedicated physical therapist specializing in orthopedic rehabilitation and sports medicine.',
      resumeUrl: '/resumes/michael-chen.pdf'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '(555) 345-6789',
      avatar: '/placeholder-avatar.jpg',
      title: 'Medical Technologist',
      experience: '2 years',
      education: 'BS Medical Technology, Northwestern University',
      location: 'Chicago, IL',
      appliedFor: 'Medical Technologist',
      jobId: 3,
      appliedDate: '2024-01-20',
      status: 'pending',
      rating: 4.5,
      certifications: ['MT(ASCP)', 'Phlebotomy Certification'],
      skills: ['Laboratory Testing', 'Quality Control', 'Equipment Maintenance', 'Data Analysis'],
      summary: 'Detail-oriented medical technologist with expertise in clinical laboratory testing.',
      resumeUrl: '/resumes/emily-rodriguez.pdf'
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '(555) 456-7890',
      avatar: '/placeholder-avatar.jpg',
      title: 'Registered Nurse',
      experience: '8 years',
      education: 'MSN, Duke University',
      location: 'Durham, NC',
      appliedFor: 'Registered Nurse - ICU',
      jobId: 1,
      appliedDate: '2024-01-15',
      status: 'rejected',
      rating: 4.7,
      certifications: ['RN License', 'CCRN', 'BLS', 'ACLS'],
      skills: ['Critical Care', 'Leadership', 'Quality Improvement', 'Staff Training'],
      summary: 'Senior ICU nurse with extensive critical care experience and leadership background.',
      resumeUrl: '/resumes/david-kim.pdf'
    }
  ];

  const isAccessible = verificationStatus === 'verified' || demoMode;
  if (!isAccessible) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidate Management</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage candidate applications.
          </p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Verification Required</CardTitle>
            <CardDescription className="text-yellow-700">
              Complete institution verification to review candidate applications.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredCandidates = demoCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.appliedFor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesView = activeView === 'all' || candidate.status === activeView;
    const matchesJob = selectedJob === 'all' || candidate.jobId.toString() === selectedJob;
    return matchesSearch && matchesView && matchesJob;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-100 text-green-800">Shortlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusUpdate = (candidateId: number, newStatus: string) => {
    console.log(`Updated candidate ${candidateId} status to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Candidate Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage candidate applications for your job postings.
        </p>
        {demoMode && (
          <Badge className="mt-2 bg-amber-100 text-amber-800">Demo Mode - Sample Applications</Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoCandidates.length : 0}</div>
            <p className="text-xs text-muted-foreground">All applications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoCandidates.filter(c => c.status === 'pending').length : 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoCandidates.filter(c => c.status === 'shortlisted').length : 0}</div>
            <p className="text-xs text-muted-foreground">Shortlisted candidates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoMode ? demoCandidates.filter(c => c.status === 'rejected').length : 0}</div>
            <p className="text-xs text-muted-foreground">Rejected applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="w-full lg:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full lg:w-auto">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="1">Registered Nurse - ICU</SelectItem>
              <SelectItem value="2">Physical Therapist</SelectItem>
              <SelectItem value="3">Medical Technologist</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
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

      {/* Candidates List */}
      {demoMode && filteredCandidates.length > 0 ? (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{candidate.name}</h3>
                        {getStatusBadge(candidate.status)}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{candidate.rating}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {candidate.title} • {candidate.experience}
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {candidate.education}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {candidate.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied {candidate.appliedDate}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Applied for: {candidate.appliedFor}</p>
                        <p className="text-sm text-gray-600">{candidate.summary}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {candidate.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{candidate.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {candidate.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {candidate.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedCandidate(candidate)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Candidate Profile - {candidate.name}</DialogTitle>
                          <DialogDescription>
                            Complete profile and application details
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={candidate.avatar} alt={candidate.name} />
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold">{candidate.name}</h3>
                              <p className="text-lg text-gray-600">{candidate.title}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>{candidate.location}</span>
                                <span>{candidate.experience} experience</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{candidate.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm">
                                <p>{candidate.email}</p>
                                <p>{candidate.phone}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Education</h4>
                              <p className="text-sm">{candidate.education}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Certifications</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.certifications.map((cert, index) => (
                                <Badge key={index} variant="outline">{cert}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Professional Summary</h4>
                            <p className="text-sm text-gray-600">{candidate.summary}</p>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download Resume
                          </Button>
                          <Button variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {candidate.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(candidate.id, 'shortlisted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Shortlist
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusUpdate(candidate.id, 'rejected')}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
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
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground">
                Applications from healthcare professionals will appear here once you post jobs.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidatesTab;
