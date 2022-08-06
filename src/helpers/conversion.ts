// tslint:disable:no-bitwise
import { HexString } from '../helpers/opaqueTypes'
// @ts-ignore
import * as utf8 from 'utf8-encoder'

export const hexToString = (hex: string): string => {
    const byteArray = hexToByteArray(hex)
    return byteArrayToString(byteArray)
}

export const stripHexPrefix = (hex: HexString) => hex.startsWith('0x')
    ? hex.slice(2) as HexString
    : hex

const byteArrayToStringBuiltin = (byteArray: number[]): string => {
    if (String.fromCodePoint != null) {
        return String.fromCodePoint.apply(null, byteArray)
    } else {
        return String.fromCharCode.apply(null, byteArray)
    }
}

export const byteArrayToString = (byteArray: number[]): string => {
    const maxSize = 256
    let index = 0
    let result = ''
    while (index < byteArray.length) {
        const slice = byteArray.slice(index, index + maxSize)
        result += byteArrayToStringBuiltin(slice)
        index += slice.length
    }
    return result
}

export const stringToHex = (s: string) => byteArrayToHex(stringToUint8Array(s))

// cheekily borrowed from https://stackoverflow.com/questions/34309988/byte-array-to-hex-string-conversion-in-javascript
export const byteArrayToHex = (byteArray: number[] | Uint8Array, withPrefix: boolean = true): HexString => {
    const prefix = withPrefix ? '0x' : ''
    return prefix + Array.from(byteArray, (byte) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2)
    }).join('') as HexString
}

export const stringToByteArray = (str: string): number[] => {
    return Array.from(stringToUint8Array(str))
}

export const hexToByteArray = (hex: string): number[] => {
    const hexWithoutPrefix = hex.startsWith('0x') ? hex.slice(2) : hex
    const subStrings: string[] = []
    for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
        subStrings.push(hexWithoutPrefix.substr(i, 2))
    }
    return subStrings.map(s => parseInt(s, 16))
}

export const hexToUint8Array = (hex: string): Uint8Array => {
    return new Uint8Array(hexToByteArray(hex))
}

export const isHexString = (s: string, strict: boolean = false): boolean => {
    const hasPrefix = s.startsWith('0x')
    if (strict && !hasPrefix) {
        return false
    }
    const hex = s.substr(hasPrefix ? 2 : 0)
    if (hex.length < 2) {
        return false
    }
    if (hex.length % 2 === 1) {
        return false
    }
    const legalChars: string = '0123456789aAbBcCdDeEfF'
    for (let i = 0; i < hex.length; i++) {
        if (!legalChars.includes(hex.charAt(i))) {
            return false
        }
    }
    return true
}

export const stringToUint8Array = (data: string): Uint8Array => utf8.fromString(data)
export const Uint8ArrayToString = (data: Uint8Array): string | never => utf8.toString(data)
