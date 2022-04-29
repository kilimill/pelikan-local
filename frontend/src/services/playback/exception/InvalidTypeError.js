import ErrorException from "@/abstract/ErrorException";

export default class InvalidTypeError extends ErrorException {
    name = 'InvalidTypeError'
}