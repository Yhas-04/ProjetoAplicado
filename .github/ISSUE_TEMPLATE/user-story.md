# 🚗 Especificação de Requisitos

## Mecanismo de Solicitação de Viagem - App de Transporte

Este documento detalha a **história de usuário**, **critérios de aceite** e **regras de negócio** para o mecanismo de solicitação de corridas, cálculo de tarifas dinâmicas e pareamento de motoristas, com foco na experiência do passageiro e na viabilidade do serviço.

---

## 📋 História de Usuário (User Story)

**Como** um passageiro urbano
**Quero** inserir meu ponto de partida e destino para visualizar o valor estimado, o tempo de chegada e solicitar um motorista parceiro
**Para que** eu possa me deslocar até o meu destino com segurança, previsibilidade de custo e conveniência

---

## ⚙️ Regras de Negócio (RN)

### RN01 - Disponibilidade de Serviço

O sistema só permite a solicitação de viagens se houver **pelo menos 1 (um) motorista ativo e disponível** em um raio de até **10 km** do ponto de partida do passageiro.

### RN02 - Cálculo da Tarifa Base

O valor da corrida é composto por:

* Tarifa fixa de partida: **R$ 5,00**
* Valor por quilômetro rodado: **R$ 2,50/km**
* Valor por minuto estimado: **R$ 0,50/min**

### RN03 - Tarifa Dinâmica (Horário de Pico)

Se a solicitação ocorrer nos horários:

* **07:00 às 09:00**
* **17:00 às 19:30**

Será aplicado um multiplicador de **1.4x** sobre o valor total.

### RN04 - Forma de Pagamento Obrigatória

O passageiro deve possuir ao menos um método válido:

* Cartão
* Pix
* Saldo em carteira

### RN05 - Cancelamento

* Até **5 minutos** após aceite → **Sem custo**
* Após 5 minutos → Taxa de **R$ 6,00**

---

## 🧪 Critérios de Aceite (BDD)

### ✅ Cenário 1: Fora do horário de pico

**Dado que** sou um passageiro autenticado com pagamento válido
**E** existem motoristas disponíveis próximos
**Quando** solicito uma corrida de 10 km e 20 min às 14:00
**Então** o sistema deve exibir:

* Valor: **R$ 40,00**
* Permitir confirmação da corrida

---

### 🔥 Cenário 2: Horário de pico

**Dado que** a mesma rota é solicitada
**Quando** ocorre às 18:15
**Então** o sistema deve:

* Aplicar multiplicador **1.4x**
* Exibir valor final: **R$ 56,00**

---

### 🚫 Cenário 3: Sem motoristas

**Dado que** estou em uma área isolada
**E** o motorista mais próximo está a 14 km
**Quando** tento solicitar
**Então** o sistema deve:

* Bloquear a solicitação
* Exibir:

  > "Não há motoristas disponíveis na sua região no momento."

---

### 💳 Cenário 4: Sem forma de pagamento

**Dado que** não tenho pagamento cadastrado
**Quando** solicito uma corrida
**Então** o sistema deve:

* Redirecionar para tela de finanças
* Exibir alerta:

  > "Adicione uma forma de pagamento para continuar."

---

### ❌ Cenário 5: Cancelamento gratuito

**Dado que** o motorista aceitou há 3 minutos
**Quando** cancelo a corrida
**Então** o sistema deve:

* Encerrar a corrida
* Exibir:

  > "Viagem cancelada sem custos"

---

## 📊 Matriz de Validação de Tarifas

| Distância | Tempo  | Horário | Tipo     | Cálculo                 | Valor    |
| --------- | ------ | ------- | -------- | ----------------------- | -------- |
| 5 km      | 10 min | 11:00   | Base     | 5 + (5×2,5) + (10×0,5)  | R$ 22,50 |
| 5 km      | 10 min | 08:00   | Dinâmica | Base × 1.4              | R$ 31,50 |
| 12 km     | 25 min | 15:30   | Base     | 5 + (12×2,5) + (25×0,5) | R$ 47,50 |
| 12 km     | 25 min | 17:45   | Dinâmica | Base × 1.4              | R$ 66,50 |
| 2 km      | 5 min  | 23:00   | Base     | 5 + (2×2,5) + (5×0,5)   | R$ 12,50 |

---

## 🛠️ Notas de Implementação Técnica

### 📍 Geolocalização

* Utilizar API de mapas (ex: Google Maps)
* Cálculo com fórmula de **Haversine**
* Processamento no backend (evitar fraude com Fake GPS)

### 💰 Consistência de Preço

* O valor exibido deve ficar **travado por 2 minutos**
* Após esse tempo:

  * Recalcular automaticamente
  * Considerar trânsito e dinâmica atual

---

## 📌 Observações Finais

Este módulo é crítico para:

* Experiência do usuário
* Equilíbrio entre oferta e demanda
* Sustentabilidade financeira do serviço

---
