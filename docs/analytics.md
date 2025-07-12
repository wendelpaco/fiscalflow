# Análise Avançada - FiscalFlow

## Visão Geral

A página de Análise Avançada fornece insights visuais e métricas detalhadas sobre o processamento de jobs de NFCe no sistema FiscalFlow.

## Funcionalidades

### 1. Métricas Principais

- **Total de Jobs**: Número total de jobs processados
- **Jobs Concluídos**: Quantidade de jobs com status "DONE"
- **Jobs com Erro**: Quantidade de jobs com status "ERROR"
- **Valor Total**: Soma de todos os valores processados

### 2. Gráficos Interativos

- **Distribuição por Status**: Gráfico de pizza mostrando a proporção de jobs por status
- **Tempo de Processamento**: Gráfico de barras com tempo de processamento por job
- **Jobs por Dia**: Gráfico de linha mostrando volume de jobs criados ao longo do tempo
- **Valor por Job**: Gráfico de barras com distribuição de valores processados

### 3. Insights Automáticos

O sistema gera insights automáticos baseados nos dados:

- **Taxa de Sucesso**: Análise da porcentagem de jobs processados com sucesso
- **Performance**: Avaliação do tempo médio de processamento
- **Volume**: Análise do volume de trabalho processado
- **Valor**: Insights sobre valores financeiros processados
- **Pendências**: Alertas sobre jobs pendentes

### 4. Filtros de Análise

- **Período**: Filtro por período (1 dia, 7 dias, 30 dias, 90 dias, todo período)
- **Status**: Filtro por status específico dos jobs

### 5. Tabela de Performance

Métricas detalhadas incluindo:

- Taxa de Sucesso
- Taxa de Erro
- Tempo Médio de Processamento
- Jobs Pendentes
- Valor Total Processado

## Tecnologias Utilizadas

- **Recharts**: Biblioteca para criação de gráficos interativos
- **React Query**: Gerenciamento de estado e cache de dados
- **Tailwind CSS**: Estilização responsiva
- **Lucide React**: Ícones modernos

## Estrutura de Arquivos

```
src/
├── app/
│   └── analytics/
│       ├── page.tsx          # Página principal de analytics
│       └── loading.tsx       # Componente de loading
├── components/
│   ├── analytics-filters.tsx # Componente de filtros
│   └── analytics-insights.tsx # Componente de insights
```

## Como Usar

1. Acesse a página "Análise Avançada" no menu principal
2. Use os filtros para refinar os dados exibidos
3. Analise os gráficos e métricas apresentados
4. Leia os insights automáticos para entender tendências
5. Consulte a tabela de performance para métricas detalhadas

## Atualizações Automáticas

A página atualiza automaticamente a cada 10 segundos para manter os dados sempre atualizados.

## Responsividade

A interface é totalmente responsiva e funciona bem em dispositivos móveis, tablets e desktops.

## Personalização

Os gráficos podem ser facilmente personalizados modificando:

- Cores dos gráficos no array `COLORS`
- Labels de status no objeto `statusLabels`
- Lógica de insights no componente `AnalyticsInsights`
- Filtros disponíveis no componente `AnalyticsFilters`
