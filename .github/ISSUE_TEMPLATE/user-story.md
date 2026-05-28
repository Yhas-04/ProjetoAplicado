Especificação de Requisitos: Mecanismo de Solicitação de Viagem - App de Transporte
Este documento detalha a história de usuário, critérios de aceite e regras de negócio para o mecanismo de solicitação de corridas, cálculo de tarifas dinâmicas e pareamento de motoristas, focado na experiência do passageiro e na viabilidade do serviço.
📋 História de Usuário (User Story)
Como um passageiro urbano
Eu quero inserir meu ponto de partida e destino para visualizar o valor estimado, o tempo de chegada e solicitar um motorista parceiro
Para que eu possa me deslocar até o meu destino com segurança, previsibilidade de custo e conveniência.
⚙️ Regras de Negócio (RN)
Disponibilidade de Serviço: O sistema só permite a solicitação de viagens se houver pelo menos 1 (um) motorista ativo e disponível em um raio de até 10 km do ponto de partida do passageiro.
Cálculo da Tarifa Base: O valor da corrida é composto por uma Tarifa Fixa de Partida (R$ 5,00) + Valor por Quilômetro Rodado (R$ 2,50/km) + Valor por Minuto Estimado (R$ 0,50/min).
Tarifa Dinâmica (Horário de Pico): Se a solicitação for feita nos horários de pico (7:00 às 9:00 ou 17:00 às 19:30 - Horário Local), um multiplicador de 1.4x é aplicado sobre o valor total da tarifa base.
Forma de Pagamento Obrigatória: O passageiro deve ter pelo menos um método de pagamento válido cadastrado (Cartão, Pix ou Saldo em Carteira) para conseguir confirmar a solicitação.
Cancelamento sem Custos: O passageiro pode cancelar a corrida sem nenhuma cobrança em até 5 minutos após o aceite do motorista. Após esse prazo, é cobrada uma taxa fixa de retenção de R$ 6,00.
🧪 Critérios de Aceite (BDD)
Cenário 1: Solicitação com motoristas disponíveis e fora do horário de pico
Dado que eu sou um passageiro autenticado e possuo um cartão de crédito válido cadastrado
E existem 3 motoristas disponíveis num raio de 4 km
Quando eu insiro a rota de 10 km (com tempo estimado de 20 minutos) às 14:00h (fora do pico)
Então o sistema deve exibir o valor exato da Tarifa Base (R$ 40,00)
E permitir que eu confirme a solicitação da viagem com sucesso.
Cenário 2: Aplicação de Tarifa Dinâmica no Horário de Pico
Dado que eu insiro exatamente a mesma rota de 10 km e 20 minutos de viagem
Quando a minha solicitação é feita às 18:15h (dentro do horário de pico)
Então o sistema deve aplicar o multiplicador de 1.4x
E exibir o valor final de R$ 56,00 para o passageiro antes da confirmação.
Cenário 3: Bloqueio por falta de Motoristas na Região
Dado que eu estou em uma zona rural isolada
E o motorista mais próximo está localizado a 14 km de distância da minha localização atual
Quando eu tentar estimar ou solicitar uma corrida
Então o sistema deve impedir a solicitação
E exibir a mensagem: "Não há motoristas disponíveis na sua região no momento."
Cenário 4: Bloqueio por falta de Método de Pagamento
Dado que eu acabei de criar minha conta e não cadastrei nenhum meio de pagamento
Quando eu tentar solicitar uma corrida
Então o sistema deve me redirecionar para a tela de finanças
E exibir o alerta: "Adicione uma forma de pagamento para continuar."
Cenário 5: Cancelamento de viagem dentro do prazo gratuito
Dado que o motorista "João" aceitou a minha corrida há exatamente 3 minutos
Quando eu clicar no botão "Cancelar Viagem"
Então o sistema deve encerrar a corrida imediatamente
E exibir a mensagem "Viagem cancelada sem custos" com taxa residual zerada.
📊 Matriz de Validação (Exemplos Práticos de Tarifa)
A tabela abaixo serve como guia para a lógica de desenvolvimento do motor de cálculo de preços e testes de integração:
Distância (km)
Tempo (min)
Horário da Chamada
Tipo de Tarifa
Cálculo Detalhado
Valor Final
5 km
10 min
11:00h
Tarifa Base
R$ 5,00 + (5 * 2,50) + (10 * 0,50)
R$ 22,50
5 km
10 min
08:00h
Tarifa Dinâmica
[R$ 5,00 + (5 * 2,50) + (10 * 0,50)] * 1.4
R$ 31,50
12 km
25 min
15:30h
Tarifa Base
R$ 5,00 + (12 * 2,50) + (25 * 0,50)
R$ 47,50
12 km
25 min
17:45h
Tarifa Dinâmica
[R$ 5,00 + (12 * 2,50) + (25 * 0,50)] * 1.4
R$ 66,50
2 km
5 min
23:00h
Tarifa Base
R$ 5,00 + (2 * 2,50) + (5 * 0,50)
R$ 12,50

🛠️ Notas de Implementação Técnica
Geolocalização: O cálculo de distância entre o passageiro e os motoristas deve utilizar a API do Google Maps (ou similar) baseada na fórmula de Haversine em tempo real no backend, evitando que simulações de GPS (Fake GPS) no celular do usuário quebrem a regra de proximidade.
Consistência de Preço: Uma vez que o preço é exibido na tela para o passageiro, esse valor deve ser "travado" por até 2 minutos. Se o usuário demorar mais de 2 minutos para clicar em "Confirmar", o sistema deve recalculá-lo para checar se houve mudança no status do trânsito ou do dinamismo.

