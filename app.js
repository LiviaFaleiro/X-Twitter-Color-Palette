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
        const apiResponse = await fetch(`/api/twitter/user/${username.substring(1)}`);
        
        const contentType = apiResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response format from server');
        }
    
        const data = await apiResponse.json();
        console.log('API Response:', data);
    
        if (!apiResponse.ok) {
            throw new Error(data.message || 'Error fetching user');
        }
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ colors })
        });
        const analysis = await analysisResponse.json();
        
        resultContainer.innerHTML = `
        <div class="alert alert-success">
            <h3>Color Profile Analysis</h3>
            <div class="personality mb-3">${analysis.personality || 'Vibrant and expressive'}</div>
            <div class="season">🌈 Season: ${analysis.season || 'A perfect blend of seasons'}</div>
        </div>
    `;
    

    } catch (error) {
        console.error('Error:', error);
        resultContainer.innerHTML = `
            <div class="alert alert-danger">
                ${error.message || 'An unexpected error occurred'}
            </div>
        `;
    }
});

function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }

    return {
        h: h,
        s: s * 100,
        l: l * 100
    };
}