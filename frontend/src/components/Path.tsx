const app_name = 'rickymetral.xyz';

export
    function buildPath(route: string): string {
        if (import.meta.env.MODE == 'development') {
            return 'http://localhost:5000/' + route;
        }
        else {
            return 'http://' + app_name + route;
        }
    }