// Mock Data for the Application

const students = [
  { id: 1, name: 'John Smith', email: 'john.smith@example.com', phone: '+1 234-567-8900', status: 'Active', program: 'Computer Science', country: 'USA', createdAt: '2024-01-15' },
  { id: 2, name: 'Emily Johnson', email: 'emily.j@example.com', phone: '+1 234-567-8901', status: 'Active', program: 'Business Administration', country: 'Canada', createdAt: '2024-02-10' },
  { id: 3, name: 'Michael Chen', email: 'michael.chen@example.com', phone: '+1 234-567-8902', status: 'Pending', program: 'Engineering', country: 'China', createdAt: '2024-03-05' },
  { id: 4, name: 'Sarah Williams', email: 'sarah.w@example.com', phone: '+1 234-567-8903', status: 'Active', program: 'Medicine', country: 'UK', createdAt: '2024-01-20' },
  { id: 5, name: 'David Brown', email: 'david.brown@example.com', phone: '+1 234-567-8904', status: 'Inactive', program: 'Law', country: 'Australia', createdAt: '2024-02-28' },
  { id: 6, name: 'Lisa Anderson', email: 'lisa.a@example.com', phone: '+1 234-567-8905', status: 'Active', program: 'Psychology', country: 'USA', createdAt: '2024-03-12' },
  { id: 7, name: 'Robert Taylor', email: 'robert.t@example.com', phone: '+1 234-567-8906', status: 'Pending', program: 'Architecture', country: 'Germany', createdAt: '2024-04-01' },
  { id: 8, name: 'Jennifer Martinez', email: 'jennifer.m@example.com', phone: '+1 234-567-8907', status: 'Active', program: 'Data Science', country: 'Spain', createdAt: '2024-03-18' },
  { id: 9, name: 'James Wilson', email: 'james.w@example.com', phone: '+1 234-567-8908', status: 'Active', program: 'MBA', country: 'India', createdAt: '2024-02-25' },
  { id: 10, name: 'Maria Garcia', email: 'maria.g@example.com', phone: '+1 234-567-8909', status: 'Active', program: 'Nursing', country: 'Mexico', createdAt: '2024-03-08' }
];

const applications = [
  { id: 1, studentId: 1, studentName: 'John Smith', university: 'Harvard University', program: 'Computer Science', status: 'Approved', appliedDate: '2024-01-20', approvedAt: '2024-01-25' },
  { id: 2, studentId: 2, studentName: 'Emily Johnson', university: 'MIT', program: 'Business Administration', status: 'Pending', appliedDate: '2024-02-15' },
  { id: 3, studentId: 3, studentName: 'Michael Chen', university: 'Stanford University', program: 'Engineering', status: 'Pending', appliedDate: '2024-03-10' },
  { id: 4, studentId: 4, studentName: 'Sarah Williams', university: 'Oxford University', program: 'Medicine', status: 'Approved', appliedDate: '2024-01-25', approvedAt: '2024-02-01' },
  { id: 5, studentId: 5, studentName: 'David Brown', university: 'Cambridge University', program: 'Law', status: 'Rejected', appliedDate: '2024-03-05' },
  { id: 6, studentId: 6, studentName: 'Lisa Anderson', university: 'Yale University', program: 'Psychology', status: 'Approved', appliedDate: '2024-03-18', approvedAt: '2024-03-22' },
  { id: 7, studentId: 7, studentName: 'Robert Taylor', university: 'Princeton University', program: 'Architecture', status: 'Pending', appliedDate: '2024-04-05' },
  { id: 8, studentId: 8, studentName: 'Jennifer Martinez', university: 'Columbia University', program: 'Data Science', status: 'Approved', appliedDate: '2024-03-25', approvedAt: '2024-03-30' },
  { id: 9, studentId: 9, studentName: 'James Wilson', university: 'Wharton School', program: 'MBA', status: 'Pending', appliedDate: '2024-03-01' },
  { id: 10, studentId: 10, studentName: 'Maria Garcia', university: 'Johns Hopkins University', program: 'Nursing', status: 'Approved', appliedDate: '2024-03-15', approvedAt: '2024-03-20' },
  { id: 11, studentId: 1, studentName: 'John Smith', university: 'UC Berkeley', program: 'Computer Science', status: 'Approved', appliedDate: '2024-02-10', approvedAt: '2024-02-15' },
  { id: 12, studentId: 2, studentName: 'Emily Johnson', university: 'NYU', program: 'Business Administration', status: 'Pending', appliedDate: '2024-03-20' }
];

const universities = [
  { id: 1, name: 'Harvard University', location: 'Cambridge, MA, USA', rank: 1, applications: 45, acceptanceRate: '5%', programs: ['Computer Science', 'Business', 'Medicine', 'Law'] },
  { id: 2, name: 'MIT', location: 'Cambridge, MA, USA', rank: 2, applications: 38, acceptanceRate: '7%', programs: ['Engineering', 'Computer Science', 'Business'] },
  { id: 3, name: 'Stanford University', location: 'Stanford, CA, USA', rank: 3, applications: 42, acceptanceRate: '4%', programs: ['Engineering', 'Computer Science', 'Business', 'Medicine'] },
  { id: 4, name: 'Oxford University', location: 'Oxford, UK', rank: 4, applications: 35, acceptanceRate: '17%', programs: ['Medicine', 'Law', 'Business', 'Humanities'] },
  { id: 5, name: 'Cambridge University', location: 'Cambridge, UK', rank: 5, applications: 32, acceptanceRate: '21%', programs: ['Medicine', 'Engineering', 'Law', 'Sciences'] },
  { id: 6, name: 'Yale University', location: 'New Haven, CT, USA', rank: 6, applications: 28, acceptanceRate: '6%', programs: ['Law', 'Medicine', 'Business', 'Arts'] },
  { id: 7, name: 'Princeton University', location: 'Princeton, NJ, USA', rank: 7, applications: 25, acceptanceRate: '6%', programs: ['Engineering', 'Sciences', 'Humanities'] },
  { id: 8, name: 'Columbia University', location: 'New York, NY, USA', rank: 8, applications: 30, acceptanceRate: '6%', programs: ['Business', 'Medicine', 'Law', 'Journalism'] },
  { id: 9, name: 'Wharton School', location: 'Philadelphia, PA, USA', rank: 9, applications: 22, acceptanceRate: '9%', programs: ['Business', 'MBA', 'Finance'] },
  { id: 10, name: 'Johns Hopkins University', location: 'Baltimore, MD, USA', rank: 10, applications: 20, acceptanceRate: '11%', programs: ['Medicine', 'Nursing', 'Public Health'] }
];

const activities = [
  { id: 1, type: 'application', message: 'John Smith applied to Harvard University', timestamp: '2024-06-15T10:30:00Z', user: 'System' },
  { id: 2, type: 'approval', message: 'Sarah Williams application approved for Oxford University', timestamp: '2024-06-15T09:15:00Z', user: 'Admin' },
  { id: 3, type: 'student', message: 'New student registered: Michael Chen', timestamp: '2024-06-14T16:45:00Z', user: 'System' },
  { id: 4, type: 'application', message: 'Emily Johnson applied to MIT', timestamp: '2024-06-14T14:20:00Z', user: 'System' },
  { id: 5, type: 'approval', message: 'Lisa Anderson application approved for Yale University', timestamp: '2024-06-14T11:00:00Z', user: 'Admin' },
  { id: 6, type: 'rejection', message: 'David Brown application rejected by Cambridge University', timestamp: '2024-06-13T15:30:00Z', user: 'Admin' },
  { id: 7, type: 'student', message: 'Student profile updated: Jennifer Martinez', timestamp: '2024-06-13T10:15:00Z', user: 'Admin' },
  { id: 8, type: 'application', message: 'Robert Taylor applied to Princeton University', timestamp: '2024-06-12T13:45:00Z', user: 'System' },
  { id: 9, type: 'approval', message: 'James Wilson application approved for Wharton School', timestamp: '2024-06-12T09:30:00Z', user: 'Admin' },
  { id: 10, type: 'application', message: 'Maria Garcia applied to Johns Hopkins University', timestamp: '2024-06-11T16:00:00Z', user: 'System' }
];

const stats = {
  students: 1250,
  applications: 1050,
  approved: 785,
  pending: 215,
  rejected: 50,
  revenue: 2850000
};

module.exports = {
  students,
  applications,
  universities,
  activities,
  stats
};
