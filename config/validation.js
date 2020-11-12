module.exports = app => {

    function existsOrError(value, msg) {
        if (!value) throw msg
        if (Array.isArray(value) && value.length === 0) throw msg
        if (typeof value === 'string' && !value.trim()) throw msg
    }

    function notExistsOrError(value, msg) {
        try {
            existsOrError(value, msg)
        } catch (msg) {
            return
        }
        throw msg
    }

    function equalsOrError(valueA, valueB, msg) {
        if (valueA !== valueB) throw msg
    }

    function parseNumber(number, decimalpoint = ",") {
        if (!number) return 0;
        
        var p = number.split(decimalpoint);
        for (var i = 0; i < p.length; i++) p[i] = p[i].replace(/\D/g, "");
        return parseFloat(p.join("."));
    }

    return { existsOrError, notExistsOrError, equalsOrError, parseNumber }
}