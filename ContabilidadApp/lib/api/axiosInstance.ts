import axios from 'axios';
import { options } from './options';
import { showUnauthorized }from '@/utils/auth'

type ResponseData = {
    info: any;
    status: number;
    message: string;
    error: any;
};

export const Get = async ({ path, sts = null, project=null, id = null, data = null, manager = null, token = null }: any): Promise<ResponseData> => {

    try {
        const { url, config } = options({ path, sts, project, id, data, manager, token });
        return axios
            .get(url, config)
            .then((response) => {
                return {
                    info: response.data,
                    status: response.status,
                    message: response.data.message ?? response.statusText,
                    error: [],
                };
            })
            .catch((error) => {
                const errorMessage = error?.response?.data?.error ?? error?.response?.statusText;
                if (error?.response?.status === 401) {
                    showUnauthorized();
                } // if the call is made from server, I currently handle it in the components getServerSideProps function

                return {
                    info: [],
                    error: error,
                    status: error?.response?.status,
                    message: errorMessage,
                };
            });
    } catch (error) {
        return {
            info: [],
            error: error,
            status: 999,
            message: 'Client side error.'
        };
    }
};


export const Post = async ({ path, data, project }: any): Promise<ResponseData> => {
    try {
        const { url, config } = options({ path, project });

        return axios
            .post(url, data, config)
            .then((response) => {
                return {
                    info: response.data,
                    status: response.status,
                    message: response.data.message ?? response.statusText,
                    error: [],
                };
            })
            .catch((error) => {
                console.log(error.response.data.error, 'error')
                const errorMessage = error.response.data.error ?? error.response.statusText;
                 if (error?.response?.status === 401) {
                    showUnauthorized();
                }

                return {
                    info: [],
                    error: error,
                    status: error.response.status,
                    message: errorMessage,
                };
            });
    } catch (error: any) {
        return ({
            info: [],
            error: error,
            status: 999,
            message: 'Client side error.'
        })
    }
};

export const Patch = async ({ path, id, data, project }: any): Promise<ResponseData> => {
    try {
        const { url, config } = options({ path, id, project });

        return axios
            .patch(url, data, config)
            .then((response) => {
                return {
                    info: response.data,
                    status: response.status,
                    message: response.data.message ?? response.statusText,
                    error: [],
                };
            })
            .catch((error) => {
                const errorMessage = error.response.data.error ?? error.response.statusText;
                 if (error?.response?.status === 401) {
                    showUnauthorized();
                }

                return {
                    info: [],
                    error: error,
                    status: error.response.status,
                    message: errorMessage,
                };
            });
    } catch (error) {
        return ({
            info: [],
            error: error,
            status: 999,
            message: 'Client side error.'
        })
    }
};

export const Delete = async ({ path, id, project }: any) => {
    try {
        const { url, config } = options({ path, id, project });

        return axios
            .delete(url, config)
            .then((response) => {
                return {
                    info: response.data,
                    status: response.status,
                    message: response.data.message ?? response.statusText,
                    error: [],
                };
            })
            .catch((error) => {
                const errorMessage = error.response.data.error ?? error.response.statusText;
                 if (error?.response?.status === 401) {
                    showUnauthorized();
                }

                return {
                    info: [],
                    error: error,
                    status: error.response.status,
                    message: errorMessage,
                };
            });
    } catch (error) {
        return ({
            info: [],
            error: error,
            status: 999,
            message: 'Client side error.'
        })
    }
};
