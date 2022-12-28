(function(Yaba) {
    'use strict';
    //@depends ./structures.js

    Yaba.app.factory('Settings', () => {
        const settings = new Yaba.models.Settings();
        settings.load();
        return settings;
    });

    Yaba.app.factory('institutions', () => {
        const institutions = new Yaba.models.Institutions();
        Yaba.institutions = institutions;
        return institutions;
    });

    Yaba.app.factory('accounts', () => {
        const accounts = new Yaba.models.Accounts();
        Yaba.accounts = accounts;
        return accounts;
    });

    return Yaba;
})(Yaba);
