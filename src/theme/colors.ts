// theme/colors.ts

export const light = (() => {
    const accent = '#2463A8';
    return {
        primary: '#219e98',
        onPrimary: '#f8f9fa',
        background: '#ebebec',
        surface: '#f6f6f7',
        placeholder: '#999999',
        accent,
        text: '#1c1c1e',
        mutedText: '#6e6e73',
        secondaryText: '#8e8e93',
        card: '#f6f6f7',
        cardShadow: '#000000',
        border: accent + '99',
        borderThin: accent + '66',
        inputBackground: '#e5e5e7',
        disabledBackground: '#dddddd',
        warning: '#ffa726',
        error: 'red',
        softError: '#D33F49',
        toggleBackground: '#f5f5f5',
        success: '#4caf50',
        toggle: '#FFD700',
    };
})();

export const dark = (() => {
    const accent = '#4DA8FF';
    return {
        primary: '#2ab3a6',
        onPrimary: '#ffffff',
        background: '#0e0e0e',
        surface: '#1a1a1a',
        placeholder: '#AAAAAA',
        accent,
        text: '#ffffff',
        mutedText: '#999999',
        secondaryText: '#aaaaaa',
        card: '#1E1E1F',
        cardShadow: '#000000',
        border: accent + '99',
        borderThin: accent + '66',
        inputBackground: '#2c2c2e',
        disabledBackground: '#3a3a3c',
        warning: '#ffa726',
        error: '#ff453a',
        softError: '#FF6B6B',
        toggleBackground: '#3a3a3c',
        success: '#4caf50',
        toggle: '#FFD700',
    };
})();
