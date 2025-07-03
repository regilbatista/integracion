import { ReactNode, createContext, useContext, useState } from 'react';

interface IAuthContext {
    id: string;
    user: string;
    token?: string;
    permissions: string;
}

export class AuthContext {
    id: string;
    user: string;
    token?: string;
    permissions: string;

    constructor();
    constructor(obj: IAuthContext);
    constructor(obj?: IAuthContext) {
        this.id = obj?.id ?? '';
        this.user = obj?.user ?? '';
        this.token = obj?.token ?? '';
        this.permissions = obj?.permissions ?? '';
    }
}

type authContextType = {
    auth: AuthContext;
    setAuth: (obj: AuthContext) => void;
};

const authContextDefaultValues: authContextType = {
    auth: new AuthContext(),
    setAuth: ({}) => {},
};

type Props = { children: ReactNode };

export const authContext = createContext<authContextType>(authContextDefaultValues);
export const useAuth = () => useContext(authContext);

export const AuthProvider = ({ children }: Props) => {

    const [auth, setAuth] = useState<AuthContext>(authContextDefaultValues.auth);

    const value = {
        auth,
        setAuth,
    };

    return <authContext.Provider value={value}>{children}</authContext.Provider>;
};
