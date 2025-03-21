const Yaba = window.Yaba;
(function(Yaba) {
    'use strict';
    //@depends ./structures.js

    Yaba.app.factory('Settings', () => {
        const settings = new Yaba.models.Settings();
        settings.load();
        Yaba.Settings = settings;
        return settings;
    });

    Yaba.app.factory('institutions', () => {
        const institutions = new Yaba.models.Institutions();
        // Global accessor for debugging.
        Yaba.institutions = institutions;
        return institutions;
    });

    Yaba.app.factory('accounts', () => {
        const accounts = new Yaba.models.Accounts();
        // Global accessor for debugging.
        Yaba.accounts = accounts;
        return accounts;
    });

    Yaba.app.factory('prospects', () => {
        const prospects = new Yaba.models.Prospects();
        // Global accessor for debugging.
        Yaba.prospects = prospects;
        return prospects;
    });

    Yaba.app.factory('gCharts', ($rootScope) => {
        Yaba.gCharts = false;
        google.charts.load(
            'current', {
                'packages': ['corechart'],
                callback: () => {
                    console.log('Google Charts ready!');
                    Yaba.gCharts = true;
                    $rootScope.$broadcast('google-charts-ready');
                }
            }
        );
        return {};
    });

    return Yaba;
})(Yaba);
