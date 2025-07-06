import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { errorValidation } from '@/utils/utilities';
import AsyncSelect from 'react-select/async';
import {showMessage} from '@/utils/notifications'
import { apiGet, apiPost, apiPatch } from '@/lib/api/admin';

const selectDefault: {
    value: string;
    label: string;
}[] = [];

const SaveUsersModal = (props: any) => {
    const { addUsersModal, setAddUsersModal, setSaveParams, saveParams, fetchUsers, usersDefault, isEdit, setIsEdit} = props;
    const [errors, setErrors] = useState<String[]>([]);
    const errorsTags = [
        'usuario',
        !isEdit && 'password',
        !isEdit && 'confirmPassword',
        'rol_Id'
    ].filter(Boolean);
    const [loading, setLoading] = useState(false);
    const [displayedRole, setDisplayedRole] = useState(JSON.parse(JSON.stringify(selectDefault)));
    const allRole: any = useRef([]);

    useEffect (() => { 
        console.log(saveParams,'saveParams');
        // Cargar roles disponibles al abrir el modal
        if (addUsersModal) {
            loadRoles();
        }
    }, [saveParams, addUsersModal]);

    const loadRoles = async () => {
        try {
            const response = await apiGet({ path: 'users/roles' });
            if (response?.info) {
                allRole.current = response.info;
                const rolesFormatted = response.info.map((item: any) => ({
                    value: item.id, // ✅ Corregido: usar item.id en lugar de item.rol_Id
                    label: item.nombreRol,
                }));
                setDisplayedRole(rolesFormatted);
            }
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    const promiseOptionsRole = async (inputValue: string = '') => {
        let result = [];

        if (inputValue !== '') {
            result = allRole.current.filter((item: any) => {
                return item.nombreRol.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            result = allRole.current;
        }

        const formattedResult = result.map((item: any) => ({
            value: item.id, // ✅ Corregido: usar item.id en lugar de item.rol_Id
            label: item.nombreRol,
        }));

        return formattedResult;
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setSaveParams({ ...saveParams, [id]: value });
    };

    const checkErrors = () => {
        const emptyList = errorValidation(errorsTags, saveParams);
        setErrors(emptyList);
        return emptyList.length;
    };

    const saveUsers = async () => {
        try {
            setLoading(true);
            
            const password = saveParams.password || '';
            const confirmPassword = saveParams.confirmPassword || '';
            
            // Validaciones específicas
            if (!isEdit) {
                if (!password || password.length < 6) {
                    setLoading(false);
                    return showMessage({msg: 'La contraseña debe tener al menos 6 caracteres', type: 'error'});
                }
                
                if (password !== confirmPassword) {
                    setLoading(false);
                    return showMessage({msg: 'Las contraseñas no coinciden', type: 'error'});
                }
            } else {
                // En modo edición, si se proporciona password, validarlo
                if (password && password.length < 6) {
                    setLoading(false);
                    return showMessage({msg: 'La nueva contraseña debe tener al menos 6 caracteres', type: 'error'});
                }
                
                if (password && password !== confirmPassword) {
                    setLoading(false);
                    return showMessage({msg: 'Las contraseñas no coinciden', type: 'error'});
                }
            }

            const errorsCount = checkErrors();
            if (errorsCount > 0) {
                setLoading(false);
                return showMessage({msg: 'Por favor complete el formulario correctamente', type: 'error'});
            }

            // Preparar datos para envío
            const dataToSend = {
                usuario: saveParams.usuario,
                rol_Id: parseInt(saveParams.rol_Id), // ✅ Asegurar que sea un número entero
                estado_Id: saveParams.estado_Id
            };

            // Solo incluir password si no está vacío
            if (password) {
                (dataToSend as any).password = password;
            }

            if (saveParams.id) {
                // Actualizar usuario
                const id = saveParams.id;
                const resp = await apiPatch({ path: 'users', data: dataToSend, id });
                if (resp?.info?.[0]?.msg !== 'ok') {
                    setLoading(false);
                    const errorMsg = resp?.info?.[0]?.error || 'Error al actualizar el usuario';
                    showMessage({msg: errorMsg, type:'error'});
                } else {
                    fetchUsers();
                    showMessage({msg:'Usuario actualizado exitosamente', type: 'success'});
                    close();
                }
            } else {
                // Crear nuevo usuario
                const resp = await apiPost({ path: 'users', data: dataToSend });
                const id = resp?.info?.[0]?.id ?? null;
                const errorMsg = resp?.info?.[0]?.error ?? null;
                
                if (id === null || errorMsg) {
                    setLoading(false);
                    showMessage({msg: errorMsg || 'Error al crear el usuario', type:'error'});
                } else {
                    fetchUsers();
                    showMessage({msg:'Usuario creado exitosamente', type: 'success'});
                    close();
                }
            }
        } catch (error) {
            console.error(error);
            showMessage({msg:'Ocurrió un error al guardar el usuario', type:'error'});
        } finally {
            setLoading(false);
        }
    }

    const onChangeValue = (newValue: any) => {
        setSaveParams({ ...saveParams, rol_Id: newValue.value });
    };

    const close = () => {
        setErrors([]);
        setIsEdit(false);
        setAddUsersModal(false);
        setSaveParams(JSON.parse(JSON.stringify(usersDefault)));
    }

    return (
        <Transition appear show={addUsersModal} as={Fragment}>
            <Dialog
                as="div"
                open={addUsersModal}
                onClose={() => {
                    close();
                }}
                className="relative z-50"
            >
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                            >
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {saveParams?.id ? 'Editar Usuario' : 'Añadir Usuario'}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            close();
                                        }}
                                        className="text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-5">
                                    <form>
                                        <div className="mb-5">
                                            <div className={`mb-5 ${errors.includes('usuario') ? 'has-error' : ''}`}>
                                                <label htmlFor="usuario" className="form-label flex">
                                                    Usuario *
                                                </label>
                                                <input
                                                    id="usuario"
                                                    type="text"
                                                    placeholder="Ingrese el nombre de usuario"
                                                    className="form-input"
                                                    value={saveParams.usuario}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('password') ? 'has-error' : ''}`}>
                                                <label htmlFor="password" className="form-label flex">
                                                    {isEdit ? 'Nueva Contraseña' : 'Contraseña *'}
                                                </label>
                                                <input 
                                                    id="password" 
                                                    type="password" 
                                                    placeholder={isEdit ? "Dejar vacío para mantener actual" : "Ingrese la contraseña"} 
                                                    className="form-input"
                                                    value={saveParams.password || ''}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('confirmPassword') ? 'has-error' : ''}`}>
                                                <label htmlFor="confirmPassword" className="form-label flex">
                                                    {isEdit ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
                                                </label>
                                                <input
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder={isEdit ? "Confirmar nueva contraseña" : "Confirme la contraseña"}
                                                    className="form-input"
                                                    value={saveParams.confirmPassword || ''}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('rol_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="rol_Id" className="form-label flex">
                                                    Rol *
                                                </label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    defaultOptions={displayedRole.length > 0 ? displayedRole : true}
                                                    value={displayedRole.find((i: any) => i.value === saveParams.rol_Id) || null}
                                                    loadOptions={promiseOptionsRole}
                                                    onChange={(newValue: any) => onChangeValue(newValue)}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona un Rol"
                                                    noOptionsMessage={() => "No se encontraron roles"}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => {
                                                    close();
                                                }}
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                type="button"
                                                className={`btn btn-primary gap-2 ltr:ml-4 rtl:mr-4 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                onClick={() => saveUsers()}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-l-transparent align-middle ltr:mr-4 rtl:ml-4"></span>
                                                        {saveParams.id ? 'Actualizando...' : 'Guardando...'}
                                                    </>
                                                ) : saveParams.id ? (
                                                    <>
                                                        <i className="fa-solid fa-edit"></i>
                                                        Actualizar
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-save"></i>
                                                        Guardar
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SaveUsersModal;