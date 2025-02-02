import { fetchUserData } from './src/api/fetchUserData.js'; // Import the fetchUserData function from the fetchUserData.js file
import { PaletteGenerator } from './src/components/PaletteGenerator.js'; // Import the PaletteGenerator component from the PaletteGenerator.js file

const translations = {
    en: {
        title: "Twitter Color Palette Generator",
        placeholder: "Enter Twitter handle",
        generateButton: "Generate Palette",
        followMe: "Follow me on twitter/x @moisiFraise",
        analysisTitle: "Color Profile Analysis"
    },
    'pt-br': {
        title: "Gerador de Paleta de Cores do Twitter",
        placeholder: "Digite o usuário do Twitter",
        generateButton: "Gerar Paleta",
        followMe: "Me siga no twitter/x @moisiFraise",
        analysisTitle: "Análise de Cores do perfil"

    }
};

let currentLang = 'en';

document.addEventListener('languageChange', (event) => {
    currentLang = event.detail;
    updatePageText();
});
function updatePageText() {
    document.querySelector('h1').textContent = translations[currentLang].title;
    document.querySelector('#username').placeholder = translations[currentLang].placeholder;
    document.querySelector('button[type="submit"]').textContent = translations[currentLang].generateButton;
    document.querySelector('.animated-text').textContent = translations[currentLang].followMe;
}

document.getElementById('profile-form').addEventListener('submit', async function (event) { 
    event.preventDefault(); 
    console.log('Form submitted'); 

    const username = document.getElementById('username').value.trim();
    const profileDataContainer = document.getElementById('profileData');
    const paletteContainer = document.getElementById('palette');
    const resultContainer = document.getElementById('result');
    const profileImage = document.getElementById('profileImage');
    const headerImage = document.getElementById('headerImage');
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');

    paletteContainer.innerHTML = '';
    resultContainer.innerHTML = '';
    profileDataContainer.style.display = 'none';

    if (!username.startsWith('@')) {
        resultContainer.innerHTML = `<div class="alert alert-warning">Please enter a valid @ handle.</div>`;
        return;
    }

    try {
        console.log('Fetching data for:', username);
        const apiResponse = await fetch(`/api/twitter/user/${username.substring(1)}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
    
        if (!apiResponse.ok) {
            const errorData = await apiResponse.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch user data');
        }
    
        const data = await apiResponse.json();
        console.log('API Response:', data);
        profileName.textContent = data.data.name;
        profileUsername.textContent = `@${data.data.username}`;
        profileImage.src = data.data.profile_image_url;
        headerImage.src = data.data.profile_banner_url;
        profileDataContainer.style.display = 'block';

        const profileVibrant = await Vibrant.from(data.data.profile_image_url).getPalette();
        const headerVibrant = await Vibrant.from(data.data.profile_banner_url).getPalette();

        const colors = [
            ...Object.values(profileVibrant).map(swatch => swatch?.hex),
            ...Object.values(headerVibrant).map(swatch => swatch?.hex)
        ].filter(Boolean);

        colors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = color;
            colorBox.setAttribute('title', color);
            colorBox.addEventListener('click', () => {
                navigator.clipboard.writeText(color);
                
                const toastContainer = document.createElement('div');
                toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                toastContainer.innerHTML = `
                    <div class="toast align-items-center text-white bg-success border-0" role="alert">
                        <div class="d-flex">
                            <div class="toast-body">
                                Color ${color} copied to clipboard!
                            </div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                        </div>
                    </div>
                `;
                document.body.appendChild(toastContainer);

                const toastElement = toastContainer.querySelector('.toast');
                const toast = new bootstrap.Toast(toastElement);
                toast.show();

                toastElement.addEventListener('hidden.bs.toast', () => {
                    toastContainer.remove();
                });
            });
            paletteContainer.appendChild(colorBox);
        });

        const analysisResponse = await fetch('/api/analyze-colors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                colors: colors.filter(color => color && color.startsWith('#')),
                language: currentLang 
            })
        });
        
        
        console.log('Colors being sent:', colors);
        const analysis = await analysisResponse.json();
        console.log('Analysis received:', analysis);
        
        resultContainer.innerHTML = `
        <div class="alert alert-success">
            <h3>${translations[currentLang].analysisTitle}</h3>
            <div class="personality mb-3">${analysis.personality}</div>
            <div class="season">🌈 ${analysis.season}</div>
        </div>
    `;
    

    } catch (error) {
        console.error('Error:', error);
        resultContainer.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
});

