import { Interface } from '@ethersproject/abi';
class Abi {
    static encode(name, jsonInputs, params) {
        const { params: inputs } = backfillParamNames(jsonInputs);
        const abi = [
            {
                type: 'function',
                name,
                inputs,
            },
        ];
        const coder = new Interface(abi);
        const valueMap = Object.fromEntries(inputs.map((input, index) => [input.name, params[index]]));
        return coder.encodeFunctionData(name, valueMap);
    }
    static encodeConstructor(jsonInputs, params) {
        const { params: inputs } = backfillParamNames(jsonInputs);
        const abi = [
            {
                type: 'constructor',
                inputs,
            },
        ];
        const coder = new Interface(abi);
        const valueMap = Object.fromEntries(inputs.map((input, index) => [input.name, params[index]]));
        return coder.encodeDeploy(valueMap);
    }
    static decode(name, jsonOutputs, data) {
        const { params: outputs, generated } = backfillParamNames(jsonOutputs);
        const abi = [
            {
                type: 'function',
                name,
                outputs,
            },
        ];
        const coder = new Interface(abi);
        const functionOutput = coder.decodeFunctionData(name, data);
        const result = outputs.map((output) => functionOutput[output.name || '']);
        for (const [name, value] of Object.entries(functionOutput.values)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const key = name;
            // Skip generated names for clarity
            if (generated.has(name)) {
                continue;
            }
            // Don't overwrite existing keys
            if (result[key]) {
                continue;
            }
            result[key] = value;
        }
        return result;
    }
}
// ABI doesn't enforce to specify param names
// However, abi-coder requires names to parse the params.
// Therefore, we "patch" the ABI by assigning unique param names.
function backfillParamNames(jsonParams) {
    const names = new Set(...jsonParams.map((param) => param.name));
    const generated = new Set();
    const params = jsonParams.map((param) => {
        const { name: originalName, indexed, type, components } = param;
        const name = originalName ? originalName : generateUniqueName(names);
        names.add(name);
        if (!originalName) {
            generated.add(name);
        }
        return {
            name,
            indexed,
            type,
            components,
        };
    });
    return {
        params,
        generated,
    };
}
function generateUniqueName(names) {
    let i = 0;
    while (names.has(i.toString())) {
        i++;
    }
    return `param${Math.random().toString().substring(2)}`;
}
export default Abi;
//# sourceMappingURL=abi.js.map