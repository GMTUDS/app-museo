document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('filterForm');
    const gallery = document.getElementById('gallery');
    const pagination = document.getElementById('pagination');
    const loader = document.getElementById('loader');
    let currentPage = 1;
    const resultsPerPage = 20;
    const maxPages = 10;

    form.reset();

    fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments')
        .then(response => response.json())
        .then(data => {
            const departmentSelect = document.getElementById('department');
            data.departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department.departmentId;
                option.textContent = departmentTranslations[department.displayName] || department.displayName;
                departmentSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
            const departmentSelect = document.getElementById('department');
            departmentSelect.innerHTML = '<option>Error al cargar departamentos</option>';
        });

    const departmentTranslations = {
        "American Decorative Arts": "Artes Decorativas Americanas",
        "Ancient Near Eastern Art": "Arte del Cercano Oriente Antiguo",
        "Arms and Armor": "Armas y Armaduras",
        "Arts of Africa, Oceania, and the Americas": "Artes de África, Oceanía y las Américas",
        "Asian Art": "Arte Asiático",
        "The Costume Institute": "El Instituto del Vestido",
        "Drawings and Prints": "Dibujos y Grabados",
        "Egyptian Art": "Arte Egipcio",
        "European Paintings": "Pinturas Europeas",
        "European Sculpture and Decorative Arts": "Escultura y Artes Decorativas Europeas",
        "Greek and Roman Art": "Arte Griego y Romano",
        "Islamic Art": "Arte Islámico",
        "The Robert Lehman Collection": "La Colección Robert Lehman",
        "The Libraries": "Las Bibliotecas",
        "Medieval Art": "Arte Medieval",
        "Musical Instruments": "Instrumentos Musicales",
        "Photographs": "Fotografías",
        "Modern Art": "Arte Moderno"
    };

    const savedDepartment = localStorage.getItem('department');
    const savedKeyword = localStorage.getItem('keyword');
    const savedLocation = localStorage.getItem('location');
    const savedPage = localStorage.getItem('currentPage');

    if (savedDepartment) document.getElementById('department').value = savedDepartment;
    if (savedKeyword) document.getElementById('keyword').value = savedKeyword;
    if (savedLocation) document.getElementById('location').value = savedLocation;
    if (savedPage) currentPage = parseInt(savedPage, 10);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const department = document.getElementById('department').value;
        const keyword = document.getElementById('keyword').value;
        const location = document.getElementById('location').value;

        if (!department && !keyword && !location) {
            alert('Por favor, complete algún parámetro de la búsqueda.');
            document.getElementById('keyword').focus();
            return;
        }

        currentPage = 1;
        localStorage.setItem('currentPage', currentPage);
        await fetchResults();
    });

    async function fetchResults() {
        gallery.innerHTML = '';
        pagination.innerHTML = '';
        loader.style.display = 'block';
        const processedTitles = new Set();

        const department = document.getElementById('department').value;
        const keyword = document.getElementById('keyword').value;
        const location = document.getElementById('location').value;

        localStorage.setItem('department', department);
        localStorage.setItem('keyword', keyword);
        localStorage.setItem('location', location);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    departamento: department,
                    keyword: keyword,
                    localizacion: location,
                }),
            });
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
            
                        if (objectData.primaryImageSmall && !processedTitles.has(objectData.title)) {
                            const title = objectData.title;
                            const culture = objectData.culture || 'N/A';
                            const dynasty = objectData.dynasty || 'N/A';
                            const date = objectData.objectDate || 'Desconocida';
            
                            processedTitles.add(title);
            
                            // Realizar la traducción antes de crear la tarjeta
                            const translatedData = await translateCard(title, culture, dynasty);
            
                            const card = document.createElement('div');
                            card.classList.add('card', 'col-md-3');
            
                            const img = document.createElement('img');
                            img.src = objectData.primaryImageSmall;
                            img.alt = translatedData.translatedTitle;
                            img.classList.add('card-img-top');
                            img.title = `Fecha de creación: ${date}`; // Muestra la fecha al pasar el mouse
            
                            const cardBody = document.createElement('div');
                            cardBody.classList.add('card-body');
            
                            const cardTitle = document.createElement('h5');
                            cardTitle.classList.add('card-title');
                            cardTitle.textContent = translatedData.translatedTitle;
            
                            const cardText = document.createElement('p');
                            cardText.classList.add('card-text');
                            cardText.innerHTML = `
                                <strong>Cultura:</strong> ${translatedData.translatedCulture}<br>
                                <strong>Dinastía:</strong> ${translatedData.translatedDynasty}
                            `;
            
                            cardBody.appendChild(cardTitle);
                            cardBody.appendChild(cardText);
                            card.appendChild(img);
                            card.appendChild(cardBody);
                            gallery.appendChild(card);
            
                            // Si hay imágenes adicionales, agregar botón
                            if (objectData.additionalImages && objectData.additionalImages.length > 0) {
                                const button = document.createElement('button');
                                button.classList.add('btn', 'btn-info', 'btn-sm');
                                button.textContent = 'Ver Imágenes Adicionales';
                                button.onclick = () => showAdditionalImages(objectData.additionalImages);
                                cardBody.appendChild(button);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching object data:', error);
                    }
                }

                for (let i = 1; i <= totalPages; i++) {
                    const button = document.createElement('button');
                    button.textContent = i;
                    button.classList.add('pagination-button');
                    button.addEventListener('click', () => {
                        currentPage = i;
                        localStorage.setItem('currentPage', currentPage);
                        fetchResults();
                    });
                    pagination.appendChild(button);
                }
            } else {
                gallery.innerHTML = '<p>No se encontraron resultados.</p>';
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            gallery.innerHTML = '<p>Error al buscar resultados. Intente nuevamente.</p>';
        } finally {
            loader.style.display = 'none';
        }
    }
    function showAdditionalImages(images) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = ''; // Limpiar contenido previo

        images.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.alt = 'Imagen adicional';
            img.classList.add('img-fluid', 'mb-2'); // Clases de Bootstrap para el estilo
            modalBody.appendChild(img);
        });

        $('#imageModal').modal('show'); // Mostrar el modal usando jQuery
    }

    // Función para traducir los atributos
    async function translateCard(title, culture, dynasty) {
        try {
            const response = await fetch('/translate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, culture, dynasty }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error al traducir atributos:', error);
            return {
                translatedTitle: title,
                translatedCulture: culture,
                translatedDynasty: dynasty
            };
        }
    }
});