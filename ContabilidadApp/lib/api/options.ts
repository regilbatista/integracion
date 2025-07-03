
import { API_URL } from '@/utils/constants';

interface RequestOptions {
    path: string;
    id?: string | null;
    sts?: any;
    project: string;
    data?: any;
    manager?: string | null;
    token?: string | null;
}

export const options = ({ path, id = null, sts = null, project, data, manager = null, token = null }: RequestOptions) => {
    // Usa template literals para construir la URL de manera más legible
    const base = `${API_URL}${project}`;
    const url = id === null ? `${base}${path}` : `${base}${path}/${id}`;
    let config: any = {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': "no-cache",
            'Accept': "/",
        },
        params: { sts, id, data, manager },
        xhrFields: {
            withCredentials: true
        }
    };

    if (token !== null) {
        config.headers['Cookie'] = `token=${token}`;
    }

    return { url, config };
};
