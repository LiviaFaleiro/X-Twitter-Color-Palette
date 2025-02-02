export default function handler(req, res) {
    const { colors, language = 'en' } = req.body;

    const descriptions = {
        en: {
            summer: {
                personality: "Energetic, outgoing, and full of life",
                season: "Summer: These vibrant warm tones reflect the energy of sunny days"
            },
            autumn: {
                personality: "Grounded, creative, and nurturing",
                season: "Autumn: Rich, warm hues that mirror falling leaves"
            },
            spring: {
                personality: "Optimistic, refreshing, and inspiring",
                season: "Spring: Fresh and bright like new beginnings"
            },
            winter: {
                personality: "Elegant, mysterious, and confident",
                season: "Winter: Cool and sophisticated tones"
            }
        },
        'pt-br': {
            summer: {
                personality: "Energético, extrovertido e cheio de vida",
                season: "Verão: Tons vibrantes e quentes que refletem a energia dos dias ensolarados"
            },
            autumn: {
                personality: "Equilibrado, criativo e acolhedor",
                season: "Outono: Tons ricos e quentes que espelham as folhas caindo"
            },
            spring: {
                personality: "Otimista, revigorante e inspirador",
                season: "Primavera: Cores frescas e brilhantes como novos começos"
            },
            winter: {
                personality: "Elegante, misterioso e confiante",
                season: "Inverno: Tons sofisticados e frios"
            }
        }
    };

    function analyzeColors(colors, lang) {
        let warmColors = 0;
        let coolColors = 0;

        colors.forEach(color => {
            const hsl = hexToHSL(color);
            if ((hsl.h >= 0 && hsl.h <= 60) || hsl.h >= 320) {
                warmColors++;
            }
            else if (hsl.h > 180 && hsl.h < 320) {
                coolColors++;
            }
        });

        if (warmColors > coolColors) {
            if (colors.some(c => hexToHSL(c).s > 70)) {
                return descriptions[lang].summer;
            } else {
                return descriptions[lang].autumn;
            }
        } else {
            if (colors.some(c => hexToHSL(c).l > 70)) {
                return descriptions[lang].spring;
            } else {
                return descriptions[lang].winter;
            }
        }
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

    const analysis = analyzeColors(colors, language);
    res.status(200).json(analysis);
}
