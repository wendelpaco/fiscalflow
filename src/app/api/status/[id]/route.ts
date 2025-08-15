import { NextResponse } from "next/server";

// Configurações da API externa
const EXTERNAL_API_BASE = "http://192.168.0.104:3000/api/status";
const AUTH_TOKEN = "17bcc4e2-416e-4172-9192-d874b60478ef";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Monta a URL final da API externa
    const externalUrl = `${EXTERNAL_API_BASE}/${id}`;

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
        { error: "Erro ao buscar status do job.", details: errorText },
        { status: response.status }
      );
    }

    // Retorna o JSON da API externa
    const data = await response.json();
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
