import { validateCPF } from '../../src/utils/validate-cpf'

describe('validateCPF', () => {
  it('deve retornar true para CPF válido sem formatação', () => {
    // Arrange
    const cpf = '52998224725'
    
    // Act
    const result = validateCPF(cpf)
    
    // Assert
    expect(result).toBe(true)
  })

  it('deve retornar true para CPF válido com formatação', () => {
    // Arrange
    const cpf = '529.982.247-25'
    
    // Act
    const result = validateCPF(cpf)
    
    // Assert
    expect(result).toBe(true)
  })

  it('deve retornar false para CPF com menos de 11 dígitos', () => {
    // Arrange
    const cpf = '1234567890'
    
    // Act
    const result = validateCPF(cpf)
    
    // Assert
    expect(result).toBe(false)
  })

  it('deve retornar false para CPF com mais de 11 dígitos', () => {
    // Arrange
    const cpf = '123456789012'
    
    // Act
    const result = validateCPF(cpf)
    
    // Assert
    expect(result).toBe(false)
  })

  it('deve retornar false para CPF com todos os dígitos iguais', () => {
    // Arrange
    const cpfs = ['00000000000', '11111111111', '22222222222', '33333333333', 
                  '44444444444', '55555555555', '66666666666', '77777777777', 
                  '88888888888', '99999999999']
    
    // Act & Assert
    cpfs.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(false)
    })
  })

  it('deve retornar false para CPF com primeiro dígito verificador inválido', () => {
    // Arrange
    // CPF válido: 52998224725, alterando o primeiro dígito verificador (2->3)
    const cpf = '52998224735'
    
    // Act
    const result = validateCPF(cpf)
    
    // Assert
    expect(result).toBe(false)
  })

  it('deve retornar false para CPF com segundo dígito verificador inválido', () => {
    // Arrange
    // CPF válido: 52998224725, alterando o segundo dígito verificador (5->6)
    const cpf = '52998224726'
    
    // Act
    const result = validateCPF(cpf)
    
    // Assert
    expect(result).toBe(false)
  })

  it('deve retornar false para valores não numéricos', () => {
    // Arrange
    const cpf = 'abc.def.ghi-jk'
    
    // Act
    const result = validateCPF(cpf)
    
    // Assert
    expect(result).toBe(false)
  })
})