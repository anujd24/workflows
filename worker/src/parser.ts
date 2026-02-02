export function parse(text: string, values: any, startDelimeter = "{", endDelimeter = "}") {
    const regex = new RegExp(`\\${startDelimeter}(.*?)\\${endDelimeter}`, "g");

    return text.replace(regex, (match, key) => {
        const keys = key.trim().split("."); 
        let localValues = values;

        for (let i = 0; i < keys.length; i++) {
            if (typeof localValues === "string") {
                try {
                    localValues = JSON.parse(localValues);
                } catch (e) {
                }
            }
            if (!localValues || typeof localValues !== 'object' || !(keys[i] in localValues)) {
                return match; 
            }
            
            localValues = localValues[keys[i]];
        }

        return localValues; 
    });
}