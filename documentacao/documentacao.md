
# Documento de Especificação de Requisitos - Centralizador

**Projeto:** Centralizador - Sistema de Comparação de Preços de Corridas (Ride Price Comparison System)  
**Data:** 19 de Junho de 2026  

---

## 1. Introdução

### 1.1. Propósito
Este documento detalha os requisitos funcionais e não funcionais do sistema **Centralizador**. O objetivo do sistema é fornecer uma plataforma unificada onde os usuários possam inserir um ponto de origem e destino, visualizar a localização em um mapa interativo e obter uma lista comparativa de preços e tempos estimados de diferentes aplicativos de transporte.

### 1.2. Escopo
O sistema abrange:
- **Interface Web (Frontend):** Permite a entrada de dados (origem/destino) com sugestão de endereços (via Nominatim/OpenStreetMap) e exibição de mapa (Leaflet).
- **Backend (Core):** Orquestra a lógica de negócio, cálculos de distância, comunicação com provedores externos (APIs de aplicativos de corrida) e persistência de dados (futuro).
- **Simuladores (Mock/Provedores):** Microsserviços auxiliares que simulam o comportamento de APIs reais de aplicativos de corrida para fins de desenvolvimento e testes.

### 1.3. Definições, Acrônimos e Abreviações
- **DTO (Data Transfer Object):** Objeto utilizado para transportar dados entre a camada de apresentação (Frontend) e a camada de serviço.
- **Command:** Objeto imutável utilizado para encapsular uma requisição dentro do sistema (Padrão de Projeto).
- **Hexagonal Architecture:** Padrão arquitetural adotado, também conhecido como Ports & Adapters, que isola a lógica de negócio (Domínio) dos detalhes técnicos externos (Banco de dados, Web, APIs).
- **Haversine Formula:** Fórmula matemática utilizada para calcular a distância geodésica entre dois pontos na superfície terrestre.

---

## 2. Visão Geral do Sistema

### 2.1. Perspectiva do Produto
O Centralizador atua como um **Agregador**. Ele não possui seus próprios motoristas ou veículos. Em vez disso, ele consome APIs de terceiros (ou simulações locais) para obter dados de preço e tempo, agregando essas informações para o usuário final.

### 2.2. Arquitetura
O sistema é baseado na **Arquitetura Hexagonal**, garantindo que o núcleo de negócio (Domínio) esteja completamente desacoplado das tecnologias externas.

- **Camada de Domínio (`domain/`):** Contém as entidades (`Location`, `Ride`, `Quote`) e as Portas (Interfaces) que definem os contratos de entrada e saída.
- **Camada de Aplicação (`adapter/in/`):** Contém os Casos de Uso (`CompareRideService`) e os Adaptadores de Entrada (`RideController`).
- **Camada de Infraestrutura (`adapter/out/`):** Contém os Adaptadores de Saída, como `SimulatorAdapter` (chamadas HTTP) e futuros repositórios JPA.

## 3. Requisitos Funcionais (RF)

### RF01 - Inserir Dados de Viagem
| Item | Descrição |
| :--- | :--- |
| **Descrição** | O usuário deve poder digitar um endereço de origem e um endereço de destino. |
| **Regras** | Os campos devem ser preenchidos com pelo menos 3 caracteres para ativar a busca de sugestões. |
| **Fontes** | O Frontend utiliza a API Nominatim (OpenStreetMap) para geocodificação e sugestões. |

### RF02 - Visualizar Mapa Interativo
| Item | Descrição |
| :--- | :--- |
| **Descrição** | O sistema deve exibir um mapa (Leaflet) com marcadores nos pontos de origem e destino selecionados. |
| **Regras** | Ao selecionar um endereço via sugestão, o mapa deve centralizar a visualização no ponto correspondente. |
| **Dependências** | Leaflet JS e OpenStreetMap tiles. |

### RF03 - Solicitar Comparação de Preços (Core)
| Item | Descrição |
| :--- | :--- |
| **Descrição** | O sistema deve processar a requisição, calcular a distância e consultar provedores de corrida para retornar uma lista de opções. |
| **Input** | `RideRequestDTO` (Origem/Destino com Nome, Lat e Lon). |
| **Processamento** | 1. Cálculo da distância via fórmula de Haversine.<br>2. Consulta a todos os provedores ativos via `RideProviderPort`.<br>3. Agregação das cotações. |
| **Output** | `RideResponseDTO` contendo a lista de provedores e preços. |

### RF04 - Manter Resiliência entre Provedores
| Item | Descrição |
| :--- | :--- |
| **Descrição** | Se um provedor específico (ex: API da Uber) estiver fora do ar ou demorar muito para responder, o sistema deve continuar processando os outros provedores. |
| **Regras** | O caso de uso (`CompareRideService`) deve capturar exceções por provedor e não interromper o fluxo principal. |

### RF05 - Persistência de Dados (Futuro)
| Item | Descrição |
| :--- | :--- |
| **Descrição** | As consultas realizadas (Ride) devem ser armazenadas em um banco de dados PostgreSQL para histórico. |
| **Regras** | Utilizar Spring Data JPA através de uma Porta de Saída (`RideRepositoryPort`) e um Adaptador JPA. |

Claro! Aqui está a **seção de autenticação de usuários** para incluir no seu documento de requisitos. Ela foi pensada para ser adicionada na parte de **Requisitos Funcionais (RF)** e também pode gerar um requisito não funcional de segurança.

---

## RF06 - Autenticação de Usuários

| Item | Descrição |
| :--- | :--- |
| **Descrição** | O sistema deverá permitir que usuários se cadastrem e façam login para acessar funcionalidades personalizadas, como histórico de consultas, favoritos ou notificações. |
| **Regras** | A autenticação será baseada em **e-mail e senha**, com sessão gerenciada via **JWT (JSON Web Token)** ou **Spring Security Session**. As senhas devem ser armazenadas de forma segura (hash + salt). |
| **Escopo** | Inicialmente, a autenticação não será obrigatória para consultar preços, mas será necessária para acessar o histórico e perfis. |
| **Tecnologias sugeridas** | Spring Security, BCrypt para hash de senhas, JWT para stateless authentication. |
| **Dependências** | Persistência de usuários em banco de dados (tabela `users`). |
| **Endpoint previstos** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |

---

## 4. Requisitos Não Funcionais (RNF)

### RNF01 - Desempenho
| Item | Descrição |
| :--- | :--- |
| **Tempo de Resposta** | A API deve responder às requisições de comparação em até **5 segundos** (considerando timeout e falhas de provedores). |
| **Concorrência** | Deve suportar pelo menos 10 requisições simultâneas durante a fase de testes. |

### RNF02 - Segurança
| Item | Descrição |
| :--- | :--- |
| **Dados** | Não serão armazenados dados sensíveis de usuários (cartões, etc.) nesta versão. |
| **APIs** | Não há necessidade de autenticação por API Key entre o Frontend e o Backend (ambiente local/controlado). |

### RNF03 - Manutenibilidade e Qualidade de Código
| Item | Descrição |
| :--- | :--- |
| **Arquitetura** | Uso estrito da **Arquitetura Hexagonal** para garantir que regras de negócio possam ser testadas sem depender de banco de dados ou APIs externas. |
| **Padronização** | Código segue o padrão de Commands para entrada de dados, garantindo imutabilidade e segurança nos casos de uso. |

### RNF04 - Portabilidade
| Item | Descrição |
| :--- | :--- |
| **Docker** | O sistema deve ser facilmente executado via Docker Compose, permitindo que novos desenvolvedores configurem o ambiente com um único comando. |

---

## 5. Regras de Negócio (RN)

### RN01 - Cálculo de Distância
| Item | Descrição |
| :--- | :--- |
| **Definição** | A distância entre origem e destino deve ser calculada utilizando a **Fórmula de Haversine**, que retorna a distância "em linha reta" (em quilômetros) no globo terrestre. |
| **Localização** | Esta regra está implementada no método `calculateDistance()` da entidade de Domínio `Ride`. |

### RN02 - Ordenação de Resultados
| Item | Descrição |
| :--- | :--- |
| **Definição** | A lista de provedores retornada ao usuário deve ser ordenada do **menor preço** para o **maior preço**. |
| **Localização** | Método `getQuotesSortedByPrice()` na entidade `Ride`. |

### RN03 - Validação de Localização
| Item | Descrição |
| :--- | :--- |
| **Definição** | Qualquer localização inserida deve possuir latitude e longitude válidas (Lat: -90 a 90; Lon: -180 a 180). O nome do local não pode ser vazio. |
| **Localização** | Construtor da classe `Location` (Domínio) lança exceção se os dados forem inválidos. |

### RN04 - Isolamento de Provedores (Fallback)
| Item | Descrição |
| :--- | :--- |
| **Definição** | A falha de comunicação com um provedor (ex: timeout) não deve impedir a consulta aos demais. Apenas uma mensagem de erro é logada no console/sistema. |

---

## 6. Especificação da API (Endpoints)

### 6.1. Comparar Preços de Corrida

**Endpoint:** `POST /api/ride/compare`  
**Descrição:** Recebe a origem e destino e retorna as opções de corrida disponíveis com preços e tempos.

**Request Body (JSON):**
```json
{
  "origin": {
    "name": "Paraguaçu Paulista, SP",
    "latitude": -22.420350,
    "longitude": -50.579210
  },
  "destination": {
    "name": "Assis, SP",
    "latitude": -22.662089,
    "longitude": -50.420623
  }
}
```

**Response Body (JSON):**
```json
{
  "id": null,
  "originName": "Paraguaçu Paulista, SP",
  "originLatitude": -22.420350,
  "originLongitude": -50.579210,
  "destinationName": "Assis, SP",
  "destinationLatitude": -22.662089,
  "destinationLongitude": -50.420623,
  "distanceKm": 30.5,
  "providers": [
    {
      "providerName": "Uber",
      "price": 25.50,
      "currency": "BRL",
      "estimatedTimeMinutes": 15
    },
    {
      "providerName": "99",
      "price": 22.90,
      "currency": "BRL",
      "estimatedTimeMinutes": 18
    }
  ]
}
```

**Códigos de Status HTTP:**
- `200 OK`: Sucesso na consulta.
- `400 Bad Request`: Dados de entrada inválidos (ex: coordenadas fora do intervalo).
- `500 Internal Server Error`: Erro inesperado no servidor.

---

## 7. Fluxo de Dados (Diagrama de Sequência Resumido)

1.  **Frontend** envia JSON para `RideController`.
2.  **RideController** converte JSON para `RideRequestDTO` e depois para `CompareRideCommand`.
3.  **CompareRideService** (caso de uso) recebe o Command.
4.  Cria as entidades de Domínio `Location` e `Ride`.
5.  Chama `ride.calculateDistance()` (Regra de Negócio).
6.  Itera sobre os provedores (`RideProviderPort`).
7.  Cada provedor (ex: `SimulatorAdapter`) faz uma requisição HTTP para um microsserviço externo.
8.  Os `Quote` retornados são adicionados à `Ride`.
9.  A `Ride` é retornada ao Controller, que a converte em `RideResponseDTO` e devolve ao Frontend.

---

## 8. Tecnologias e Stack

- **Java 21**
- **Spring Boot 3** (Core, Web, Data JPA)
- **Maven** (Gerenciador de dependências)
- **PostgreSQL** (Banco de dados relacional)
- **Hibernate / JPA** (ORM)
- **Leaflet + Nominatim** (Frontend - Mapa e Geocodificação)
- **Docker** (Containerização)
- **Arquitetura Hexagonal** (Padrão arquitetural)

---

## 9. Aprovação e Considerações Finais

Este documento reflete o estado atual do projeto (v1.0). Atualizações futuras, como a implementação completa da persistência JPA e a criação de novos adaptadores (Uber, 99, Lyft), devem ser refletidas em versões subsequentes deste documento.