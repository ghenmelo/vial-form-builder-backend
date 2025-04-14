import Ajv from 'ajv'

export default function ajvFormats(ajv: Ajv): Ajv {
  ajv.addFormat('valid-json', {
    type: 'string',
    validate: (str: string) => {
      try {
        console.log(str)
        JSON.parse(String(str))
        return true
      } catch {
        return false
      }
    },
  })

  return ajv
}
