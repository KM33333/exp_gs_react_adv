// 設計図 カラムを追加するときなどに使う。
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
  
  export const sessions = pgTable("sessions", {    
    id: serial("id").primaryKey(),              // 通し番号（主キー・自動）
    userId: text("user_id").notNull(),          // 誰のデータか
    topic: text("topic").notNull(),             // お題
    answerText: text("answer_text"),            // 回答
    smileScore: integer("smile_score"),         // 笑顔スコア
    sadScore: integer("sad_score"),             // 悲しみスコア
    angryScore: integer("angry_score"),         // 怒りスコア
    surprisedScore: integer("surprised_score"), // 驚きスコア
    neutralScore: integer("neutral_score"),     // 無表情スコア
    fearfulScore: integer("fearful_score"),     // 恐怖スコア
    disgustedScore: integer("disgusted_score"), // 嫌悪スコア
    feedback: text("feedback"),                 // AIのフィードバック
    createdAt: timestamp("created_at").defaultNow().notNull(), // 作成日時
    memo: text("memo"),// 任意のメモ
  });