export const formatDateTime = (date) => {
    if (!date) return '';

    const sortDate = date.split('T')[0];
    const dat = sortDate.split('-');

    return dat[1] + '/' + dat[2] + '/' + dat[0];
};


export const errorValidation = (errorsTags, saveParams) => {
    const emptyList = [];
    errorsTags.map((item) => {
        if (saveParams[item] === '' || saveParams[item] === null) emptyList.push(item);
    });
    return emptyList;
};

export const validaCedula = (cedula) => {
    // Eliminar guiones de la cédula
    const vcCedula = cedula.replace(/-/g, "");
    const pLongCed = vcCedula.trim().length;
    const digitoMult = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
  
    // Validar que la cédula tenga exactamente 11 dígitos
    if (pLongCed !== 11) return false;
  
    let vnTotal = 0;
  
    for (let vDig = 0; vDig < pLongCed; vDig++) {
      const vCalculo = parseInt(vcCedula[vDig]) * digitoMult[vDig];
  
      if (vCalculo < 10) {
        vnTotal += vCalculo;
      } else {
        vnTotal +=
          parseInt(vCalculo.toString().charAt(0)) +
          parseInt(vCalculo.toString().charAt(1));
      }
    }
  
    return vnTotal % 10 === 0;
  };
  
