document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#buscador form');
    const grilla = document.getElementById('grilla');
    const paginacion = document.getElementById('paginacion');
    const loader = document.createElement('div'); // Crear indicador de carga
    loader.textContent = 'Cargando...';
    loader.style.display = 'none';
    document.body.appendChild(loader);

    let currentPage = 1;
    const resultsPerPage = 20;
    const maxPages = 10; // Limitar a 10 páginas

    // Cargar opciones de departamentos
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments')
    .then(response => response.json())
    .then(data => {
        const departmentSelect = document.getElementById('departamento');
        
        // Añadir la opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione un departamento';
        departmentSelect.appendChild(defaultOption);

        // Agregar las opciones de departamento
        data.departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.departmentId;
            option.textContent = department.displayName; // o el nombre que desees mostrar
            departmentSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching departments:', error);
    });
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        currentPage = 1; // Restablecer a la primera página en una nueva búsqueda
        await fetchResults();
    });

    async function fetchResults() {
        grilla.innerHTML = '';
        paginacion.innerHTML = ''; // Limpiar paginación antes de agregar nuevos botones
        loader.style.display = 'block'; // Mostrar indicador de carga

        const departamento = document.getElementById('departamento').value;
        const keyword = document.getElementById('keyword').value;
        const localizacion = document.getElementById('localizacion').value;

        let url = 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true';
        url += keyword ? `&q=${keyword}` : '&q=""';
        if (departamento) url += `&departmentId=${departamento}`;
        if (localizacion) url += `&geoLocation=${localizacion}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.objectIDs) {
                const totalResults = data.objectIDs.length;
                const totalPages = Math.min(Math.ceil(totalResults / resultsPerPage), maxPages);
                const start = (currentPage - 1) * resultsPerPage;
                const end = start + resultsPerPage;
                const objectIDs = data.objectIDs.slice(start, end);

                for (const id of objectIDs) {
                    try {
                        const objectResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                        const objectData = await objectResponse.json();

                        if (objectData.primaryImageSmall) {
                            const card = document.createElement('div');
                            card.classList.add('objeto');

                            const img = document.createElement('img');
                            img.src = objectData.primaryImageSmall;
                            img.alt = objectData.title;

                            const title = document.createElement('h4');
                            title.classList.add('titulo');
                            title.textContent = objectData.title;

                            const culture = document.createElement('h6');
                            culture.classList.add('cultura');
                            culture.textContent = `Cultura: ${objectData.culture || 'N/A'}`;

                            const dynasty = document.createElement('h6');
                            dynasty.classList.add('dinastia');
                            dynasty.textContent = `Dinastía: ${objectData.dynasty || 'N/A'}`;

                            card.appendChild(img);
                            card.appendChild(title);
                            card.appendChild(culture);
                            card.appendChild(dynasty);
                            grilla.appendChild(card);
                        }
                    } catch (error) {
                        console.error(`Error fetching object data for ID ${id}:`, error);
                    }
                }

                // Agregar botones de paginación
                for (let i = 1; i <= totalPages; i++) {
                    const button = document.createElement('button');
                    button.textContent = i;
                    button.classList.add('pagination-button');
                    button.addEventListener('click', async () => {
                        currentPage = i;
                        await fetchResults();
                    });
                    paginacion.appendChild(button);
                }
            } else {
                grilla.innerHTML = '<p>No se encontraron resultados.</p>';
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            grilla.innerHTML = '<p>Hubo un error al recuperar los resultados. Por favor, inténtelo de nuevo más tarde.</p>';
        } finally {
            loader.style.display = 'none'; // Ocultar indicador de carga
        }
    }
});