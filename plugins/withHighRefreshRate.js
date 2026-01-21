const { withMainActivity, withProjectBuildGradle } = require('@expo/config-plugins');

const withAndroidHighRefreshRate = (config) => {
    return withMainActivity(config, (config) => {
        const mainActivity = config.modResults;
        const contents = mainActivity.contents;

        // Check if we already added the import
        if (!contents.includes('import android.view.WindowManager')) {
            const importMatch = contents.match(/package .+/);
            if (importMatch) {
                mainActivity.contents = contents.replace(
                    importMatch[0],
                    `${importMatch[0]}\nimport android.view.WindowManager;`
                );
            }
        }

        // Add the refresh rate code to onCreate
        if (!mainActivity.contents.includes('// Enable High Refresh Rate')) {
            const onCreateMatch = mainActivity.contents.match(/super\.onCreate\(savedInstanceState\);?/);
            if (onCreateMatch) {
                mainActivity.contents = mainActivity.contents.replace(
                    onCreateMatch[0],
                    `${onCreateMatch[0]}
    // Enable High Refresh Rate
    try {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
             getWindow().getAttributes().setFitInsetsTypes(android.view.WindowInsets.Type.statusBars() | android.view.WindowInsets.Type.navigationBars());
             getWindow().getAttributes().setFitInsetsSides(android.view.WindowInsets.Side.all());
             getWindow().setDecorFitsSystemWindows(false);
        }
        
        // Force 120Hz / High Refresh Rate
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            java.util.Arrays.stream(getWindowManager().getDefaultDisplay().getSupportedModes())
                .max(java.util.Comparator.comparingDouble(android.view.Display.Mode::getRefreshRate))
                .ifPresent(mode -> {
                    android.view.WindowManager.LayoutParams params = getWindow().getAttributes();
                    params.preferredDisplayModeId = mode.getModeId();
                    getWindow().setAttributes(params);
                });
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
`
                );
            }
        }

        return config;
    });
};

module.exports = withAndroidHighRefreshRate;
