import { createContext, useContext, useState, ReactNode } from "react";

// Define the user type (adjust according to your user object structure)
interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

// Define the context type
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Define the provider props type
interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};