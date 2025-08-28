// Mock authentication system for frontend testing
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'professional' | 'employer' | 'admin';
  avatar?: string;
  isVerified: boolean;
}

// Sample test accounts
export const sampleUsers: User[] = [
  {
    id: '1',
    email: 'nurse@demo.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'professional',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    isVerified: true
  },
  {
    id: '2', 
    email: 'employer@demo.com',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'employer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    isVerified: true
  },
  {
    id: '3',
    email: 'admin@demo.com', 
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    isVerified: true
  }
];

class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Check for existing session
    const savedUser = localStorage.getItem('carechain_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const user = sampleUsers.find(u => u.email === email);
        
        if (user && password === 'demo123') {
          this.currentUser = user;
          
          if (rememberMe) {
            localStorage.setItem('carechain_user', JSON.stringify(user));
          } else {
            sessionStorage.setItem('carechain_user', JSON.stringify(user));
          }
          
          this.notifyListeners();
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  }

  register(userData: any): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isVerified: false
        };
        
        this.currentUser = newUser;
        sessionStorage.setItem('carechain_user', JSON.stringify(newUser));
        this.notifyListeners();
        resolve(newUser);
      }, 1000);
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('carechain_user');
    sessionStorage.removeItem('carechain_user');
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const authService = new AuthService();