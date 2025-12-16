import { GoogleGenAI, Type } from "@google/genai";
import { Vehicle } from "../types";

const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getVehicleRecommendation = async (
  query: string,
  availableVehicles: Vehicle[]
): Promise<{ recommendation: string; vehicleId: string | null }> => {
  if (!API_KEY) {
    return { recommendation: "Vui lòng cấu hình API Key.", vehicleId: null };
  }

  const vehiclesContext = availableVehicles
    .map(v => `ID: ${v.id}, Xe: ${v.name} (${v.type}), Ghế: ${v.seats}, Tiện ích: ${v.features.join(', ')}`)
    .join('\n');

  const prompt = `
    Bạn là Điều phối viên đội xe VinFleet.
    Chọn xe tối ưu nhất cho yêu cầu: "${query}".
    Danh sách xe sẵn sàng:
    ${vehiclesContext}
    
    Phản hồi JSON: { "vehicleId": string | null, "reasoning": "Giải thích tiếng Việt ngắn gọn, chuyên nghiệp" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vehicleId: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      recommendation: result.reasoning || "Không tìm thấy xe phù hợp.",
      vehicleId: result.vehicleId || null
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { recommendation: "Lỗi kết nối AI.", vehicleId: null };
  }
};

export const analyzeFleetUsage = async (bookings: any[], revenueData: any): Promise<string> => {
   if (!API_KEY) return "Cần API Key để phân tích.";

   const summary = JSON.stringify({
     recentBookings: bookings.slice(0, 5),
     revenueStats: revenueData
   });
   
   const prompt = `
     Với vai trò chuyên gia phân tích vận hành VinFleet (Hà Nội), hãy phân tích dữ liệu sau:
     ${summary}
     
     Đưa ra 3 nhận xét ngắn gọn (gạch đầu dòng) tập trung vào:
     1. Hiệu suất sử dụng xe.
     2. Hiệu quả doanh thu/chi phí.
     3. Cảnh báo hoặc gợi ý tối ưu vận hành.
     Giọng văn chuyên nghiệp, ngắn gọn.
   `;

   try {
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: prompt,
     });
     return response.text || "Chưa có dữ liệu phân tích.";
   } catch (e) {
     return "Hệ thống AI đang bận.";
   }
};