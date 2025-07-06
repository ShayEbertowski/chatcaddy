export const light = (() => {
    const accent = '#2463A8';
    const primary = '#219e98';
    const onPrimary = '#f8f9fa';

    return {
        primary,
        onPrimary,
        primarySoft: primary + '33',         // NEW
        onPrimarySoft: onPrimary,            // NEW

        background: '#ebebec',
        surface: '#f6f6f7',
        onSurface: '#1c1c1e',
        placeholder: '#999999',
        accent,
        onAccent: '#ffffff',
        onAccentSoft: '#ffffff',             // NEW (same as onAccent)
        accentSoft: accent + '88',
        text: '#1c1c1e',
        mutedText: '#6e6e73',
        secondaryText: '#8e8e93',
        card: '#f6f6f7',
        cardShadow: '#000000',
        border: accent + '99',
        borderThin: accent + '66',
        inputBackground: '#e5e5e7',
        disabled: '#dddddd',
        warning: '#ffa726',
        error: 'red',
        softError: '#D33F49',
        toggleBackground: '#f5f5f5',
        success: '#4caf50',
        toggle: '#FFD700',
        switchTrackOn: '#007AFF',
        switchTrackOff: '#ccc',
        switchThumbOn: '#fff',
        switchThumbOff: '#fff',
        buttonText: '#FFFFFF',
        modalBackground: 'rgba(0, 0, 0, 0.4)',
        nodeCard: '#FAFAFA',
        nodeBorder: '#E0E0E0',
        chipBackground: '#EFEFEF',
        chipText: '#333333',

        // ➕ Navigation additions
        navigation: '#c4c4c4',
        onNavigation: '#1c1c1e',
        navigationSoft: '#c4c4c488',

        expandToggleBackground: '#e0f2ff',
        expandToggleIcon: '#2463A8',
        collapseToggleBackground: '#e5e5e7',
        collapseToggleIcon: '#555555',

        toggleIconNeutral: '#5C7CFA', //not sure im happy with this color, good for now
    };
})();

export const dark = (() => {
    const accent = '#4DA8FF';
    const primary = '#2ab3a6';
    const onPrimary = '#ffffff';

    return {
        primary,
        onPrimary,
        primarySoft: primary + '33',         // NEW
        onPrimarySoft: onPrimary,            // NEW

        background: '#0e0e0e',
        surface: '#1a1a1a',
        onSurface: '#ffffff',
        placeholder: '#AAAAAA',
        accent,
        onAccent: '#000000',
        onAccentSoft: '#000000',             // NEW (same as onAccent)
        accentSoft: accent + '88',
        text: '#ffffff',
        mutedText: '#999999',
        secondaryText: '#aaaaaa',
        card: '#1E1E1F',
        cardShadow: '#000000',
        border: accent + '99',
        borderThin: accent + '66',
        inputBackground: '#2c2c2e',
        disabled: '#3a3a3c',
        warning: '#ffa726',
        error: '#ff453a',
        softError: '#FF6B6B',
        toggleBackground: '#3a3a3c',
        success: '#4caf50',
        toggle: '#FFD700',
        switchTrackOn: '#4D90FE',
        switchTrackOff: '#333',
        switchThumbOn: '#fff',
        switchThumbOff: '#fff',
        buttonText: '#FFFFFF',
        modalBackground: 'rgba(0, 0, 0, 0.6)',
        nodeCard: '#1C1C1C',
        nodeBorder: '#333333',
        chipBackground: '#2C2C2C',
        chipText: '#FFFFFF',

        // ➕ Navigation additions
        navigation: '#444444',
        onNavigation: '#ffffff',
        navigationSoft: '#44444488',

        expandToggleBackground: '#1c3b5a',
        expandToggleIcon: '#4DA8FF',
        collapseToggleBackground: '#2c2c2e',
        collapseToggleIcon: '#bbbbbb',

        toggleIconNeutral: '#5C7CFA', //not sure im happy with this color, good for now
    };
})();
