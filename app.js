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
        const apiResponse = await fetch(`http://localhost:3000/api/twitter/user/${username.substring(1)}`);
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
                alert(`Color ${color} copied to clipboard!`);
            });
            paletteContainer.appendChild(colorBox);
        });

        const season = analyzeSeason(colors);
        resultContainer.innerHTML = `
            <div class="alert alert-success">
                <h3>Matching Season: ${season.name}</h3>
                <p>${season.description}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('rate limit')) {
            resultContainer.innerHTML = `
                <div class="alert alert-info">
                    <h4>Taking a break!</h4>
                    <p>We'll try again in a few minutes.</p>
                    <div class="progress mt-2">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" 
                             style="width: 0%"></div>
                    </div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message}
                </div>
            `;
        }
    }
});

function analyzeSeason(colors) {
    const seasonRanges = {
        summer: {
            hues: [[330, 360], [0, 30]],
            saturation: [30, 70],
            lightness: [45, 85]
        },
        winter: {
            hues: [[180, 270]],
            saturation: [40, 100],
            lightness: [20, 60]
        },
        spring: {
            hues: [[45, 150]],
            saturation: [60, 100],
            lightness: [50, 85]
        },
        fall: {
            hues: [[15, 45]],
            saturation: [40, 90],
            lightness: [30, 60]
        }
    };

    const colorMatches = {
        summer: 0,
        winter: 0,
        spring: 0,
        fall: 0
    };

    colors.forEach(color => {
        const hsl = hexToHSL(color);
        
        Object.entries(seasonRanges).forEach(([season, ranges]) => {
            const hueMatch = ranges.hues.some(([min, max]) => 
                hsl.h >= min && hsl.h <= max
            );
            const satMatch = hsl.s >= ranges.saturation[0] && hsl.s <= ranges.saturation[1];
            const lightMatch = hsl.l >= ranges.lightness[0] && hsl.l <= ranges.lightness[1];
            
            if (hueMatch && satMatch && lightMatch) {
                colorMatches[season] += 1;
            }
        });
    });

    const maxSeason = Object.entries(colorMatches)
        .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    const seasons = {
        summer: {
            name: 'Summer',
            description: 'A vibrant palette with warm pinks and bright reds, reflecting the energy and warmth of summer days.'
        },
        winter: {
            name: 'Winter',
            description: 'Deep blues and cool purples create a sophisticated and dramatic winter atmosphere.'
        },
        spring: {
            name: 'Spring',
            description: 'Fresh yellows and vibrant greens capture the essence of nature s renewal and spring vitality.'
        },
        fall: {
            name: 'Fall',
            description: 'Rich oranges and earthy browns evoke the warmth and coziness of autumn landscapes.'
        }
    };

    return seasons[maxSeason];
}

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
