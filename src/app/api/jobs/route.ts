import { NextResponse } from "next/server";

// Configurações da API externa
const EXTERNAL_API_BASE = "http://localhost:3000/queue/jobs";
const AUTH_TOKEN = "5b289e19-c6f0-4f27-bd42-1e6b46fb82f5";

export async function GET(request: Request) {
  try {
    // Extrai a query string manualmente (funciona mesmo com URL relativa)
    const url = request.url;
    const queryIndex = url.indexOf("?");
    const queryString = queryIndex !== -1 ? url.substring(queryIndex) : "";

    // Extrai page e limit da query
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Monta a URL final da API externa (proxy os parâmetros)
    const externalUrl = `${EXTERNAL_API_BASE}${queryString}`;

    // Faz o proxy da requisição para a API externa
    const response = await fetch(externalUrl, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // Se a resposta não for OK, retorna erro
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Erro ao buscar jobs do backend.", details: errorText },
        { status: response.status }
      );
    }

    // Retorna o JSON da API externa
    const data = await response.json();

    // Fallback: se a API externa NÃO suportar paginação, paginar manualmente
    if (!data.jobs && Array.isArray(data)) {
      // data é um array de jobs
      const total = data.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const jobs = data.slice(start, end);
      return NextResponse.json({ jobs, total });
    }

    // Se a API externa já retorna jobs e total, apenas repasse
    return NextResponse.json(data);
  } catch (error: any) {
    // Tratamento de erro genérico
    return NextResponse.json(
      {
        error: "Erro de conexão com o backend.",
        details: error?.message || error,
      },
      { status: 500 }
    );
  }
}
