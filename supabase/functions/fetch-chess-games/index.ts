import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChessGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  tcn?: string;
  uuid?: string;
  initial_setup?: string;
  fen?: string;
  time_class: string;
  rules: string;
  white: {
    rating: number;
    result: string;
    username: string;
  };
  black: {
    rating: number;
    result: string;
    username: string;
  };
}

interface MonthlyArchive {
  games: ChessGame[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { username, year, month, limit } = await req.json();

    if (!username) {
      return new Response(
        JSON.stringify({ error: "Username is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const gameLimit = limit || 20;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let gamesImported = 0;
    const errorLogs: string[] = [];

    if (year && month) {
      const paddedMonth = String(month).padStart(2, "0");
      const archiveUrl = `https://api.chess.com/pub/player/${username}/games/${year}/${paddedMonth}`;

      const response = await fetch(archiveUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const data: MonthlyArchive = await response.json();

      if (data.games && data.games.length > 0) {
        const gamesToInsert = data.games.map((game) => ({
          month: parseInt(month),
          year: parseInt(year),
          url: game.url,
          pgn: game.pgn,
          time_control: game.time_control,
          rated: game.rated,
          time_class: game.time_class,
          rules: game.rules,
          white_rating: game.white.rating,
          white_result: game.white.result,
          white_username: game.white.username,
          black_rating: game.black.rating,
          black_result: game.black.result,
          black_username: game.black.username,
        }));

        for (let i = 0; i < gamesToInsert.length; i += 100) {
          const batch = gamesToInsert.slice(i, i + 100);
          const { error } = await supabase.from("chess_games").insert(batch);

          if (error) {
            const errorMsg = `Database error: ${error.message} | Details: ${JSON.stringify(error.details)} | Hint: ${error.hint}`;
            console.error("Error inserting batch:", errorMsg);
            errorLogs.push(errorMsg);

            return new Response(
              JSON.stringify({
                error: "Import failed due to database error",
                errorLog: errorLogs,
                gamesImported,
                details: error.message,
                hint: error.hint
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          } else {
            gamesImported += batch.length;
          }
        }
      }
    } else {
      const archivesUrl = `https://api.chess.com/pub/player/${username}/games/archives`;
      const archivesResponse = await fetch(archivesUrl);

      if (!archivesResponse.ok) {
        throw new Error(`Failed to fetch archives: ${archivesResponse.statusText}`);
      }

      const archivesData = await archivesResponse.json();
      const archives = archivesData.archives || [];

      const reversedArchives = archives.reverse();

      for (const archiveUrl of reversedArchives) {
        if (gamesImported >= gameLimit) {
          break;
        }

        const urlParts = archiveUrl.split("/");
        const archiveYear = parseInt(urlParts[urlParts.length - 2]);
        const archiveMonth = parseInt(urlParts[urlParts.length - 1]);

        const response = await fetch(archiveUrl);
        if (!response.ok) {
          console.error(`Failed to fetch ${archiveUrl}`);
          continue;
        }

        const data: MonthlyArchive = await response.json();

        if (data.games && data.games.length > 0) {
          const reversedGames = data.games.reverse();
          const gamesToImport = reversedGames.slice(0, gameLimit - gamesImported);

          const gamesToInsert = gamesToImport.map((game) => ({
            month: archiveMonth,
            year: archiveYear,
            url: game.url,
            pgn: game.pgn,
            time_control: game.time_control,
            rated: game.rated,
            time_class: game.time_class,
            rules: game.rules,
            white_rating: game.white.rating,
            white_result: game.white.result,
            white_username: game.white.username,
            black_rating: game.black.rating,
            black_result: game.black.result,
            black_username: game.black.username,
          }));

          for (let i = 0; i < gamesToInsert.length; i += 100) {
            const batch = gamesToInsert.slice(i, i + 100);
            const { error } = await supabase.from("chess_games").insert(batch);

            if (error) {
              const errorMsg = `Database error: ${error.message} | Details: ${JSON.stringify(error.details)} | Hint: ${error.hint}`;
              console.error("Error inserting batch:", errorMsg);
              errorLogs.push(errorMsg);

              return new Response(
                JSON.stringify({
                  error: "Import failed due to database error",
                  errorLog: errorLogs,
                  gamesImported,
                  details: error.message,
                  hint: error.hint
                }),
                {
                  status: 500,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            } else {
              gamesImported += batch.length;
            }
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        gamesImported,
        message: `Successfully imported ${gamesImported} games`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
