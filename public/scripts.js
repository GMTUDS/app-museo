const URL_DEPARTAMENTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";

function fetchDepartamentos() {
    fetch(URL_DEPARTAMENTOS)
        .then((response) => response.json())
        .then((data) => {
        //carga el select con los departamentos
            const departamentoSelect = document.getElementById("departamento");
            data.departments.forEach((departamento) => {
                const option = document.createElement("option");
                option.value = departamento.departmentId;
                option.textContent = departamento.displayName;
                departamentoSelect.appendChild(option);
            });
        })
        .catch((error) => console.error('Error:', error));
}
fetchDepartamentos();