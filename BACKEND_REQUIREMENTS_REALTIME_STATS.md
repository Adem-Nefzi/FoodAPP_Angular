# 🔧 Backend Requirements for Real-Time Recipe Stats

## 📋 Overview

The frontend now has **real-time animated statistics** that update instantly when users interact with recipes. For this to work properly, the **backend needs to track and return** two additional fields in the Recipe model.

---

## 🎯 Required Backend Changes

### **1. Update Recipe Schema/Entity**

Add these two fields to your Recipe model:

```typescript
// NestJS (MongoDB/Mongoose)
@Schema()
export class Recipe {
  // ... existing fields

  @Prop({ default: 0 })
  totalFavorites: number; // Total count of users who favorited this recipe

  @Prop({ default: 0 })
  totalRatings: number; // Total count of ratings (not average, but count)

  // ... rest of fields
}
```

```java
// Spring Boot (if using)
@Entity
public class Recipe {
    // ... existing fields

    @Column(nullable = false)
    private Integer totalFavorites = 0;

    @Column(nullable = false)
    private Integer totalRatings = 0;

    // ... rest of fields
}
```

---

### **2. Update Favorite Toggle Endpoint**

When a user favorites/unfavorites a recipe, update the counter:

**Endpoint**: `POST /favorites/toggle` or similar

**Logic**:

```typescript
// Pseudo-code for NestJS
async toggleFavorite(userId: string, recipeId: string) {
  const favorite = await this.findExisting(userId, recipeId);

  if (favorite) {
    // Unfavoriting - DECREMENT counter
    await this.favoritesRepository.delete(favorite.id);
    await this.recipesRepository.increment(
      { id: recipeId },
      'totalFavorites',
      -1
    );
    return { isFavorite: false };
  } else {
    // Favoriting - INCREMENT counter
    await this.favoritesRepository.create({ userId, recipeId });
    await this.recipesRepository.increment(
      { id: recipeId },
      'totalFavorites',
      1
    );
    return { isFavorite: true };
  }
}
```

**Important**: Use atomic increment/decrement operations to prevent race conditions!

---

### **3. Update Rating Creation Endpoint**

When a user creates a rating, increment the counter (only for NEW ratings):

**Endpoint**: `POST /ratings` or similar

**Logic**:

```typescript
// Pseudo-code for NestJS
async createOrUpdateRating(dto: CreateRatingDto) {
  const existingRating = await this.findByUserAndRecipe(
    dto.userId,
    dto.recipeId
  );

  if (existingRating) {
    // UPDATE - Don't increment counter (already counted)
    existingRating.stars = dto.stars;
    await this.ratingsRepository.save(existingRating);

    // Recalculate average rating
    await this.updateAverageRating(dto.recipeId);

    return existingRating;
  } else {
    // CREATE - INCREMENT counter
    const newRating = await this.ratingsRepository.create(dto);

    // Increment total ratings count
    await this.recipesRepository.increment(
      { id: dto.recipeId },
      'totalRatings',
      1
    );

    // Recalculate average rating
    await this.updateAverageRating(dto.recipeId);

    return newRating;
  }
}
```

---

### **4. Initialize Existing Data** (One-time migration)

If you already have recipes in your database, run a migration to populate these fields:

```typescript
// Migration script
async function migrateRecipeStats() {
  const recipes = await Recipe.find();

  for (const recipe of recipes) {
    // Count existing favorites
    const favCount = await Favorite.countDocuments({ recipeId: recipe.id });
    recipe.totalFavorites = favCount;

    // Count existing ratings
    const ratingCount = await Rating.countDocuments({ recipeId: recipe.id });
    recipe.totalRatings = ratingCount;

    await recipe.save();
  }
}
```

---

## 📊 Updated Recipe DTO

Your Recipe response DTO should include these fields:

```typescript
export class RecipeResponseDto {
  id: string;
  title: string;
  description: string;
  // ... other fields

  averageRating: number; // Already exists
  totalRatings: number; // ⭐ NEW - total count of ratings
  totalFavorites: number; // ⭐ NEW - total count of favorites

  // ... rest
}
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ├─── Favorite Recipe
         │    ├─ Toggle favorite in DB
         │    ├─ Increment/Decrement totalFavorites
         │    └─ Return updated recipe
         │
         ├─── Rate Recipe
         │    ├─ Create/update rating in DB
         │    ├─ Increment totalRatings (if new)
         │    ├─ Recalculate averageRating
         │    └─ Return updated recipe
         │
         └─── Load Recipe
              └─ Return recipe with all stats
```

---

## ✅ Testing Checklist

### **Test Case 1: Favorite Toggle**

1. User favorites recipe (totalFavorites: 0 → 1) ✓
2. Another user favorites same recipe (1 → 2) ✓
3. First user unfavorites (2 → 1) ✓
4. Verify counter never goes negative ✓

### **Test Case 2: Rating Creation**

1. User rates recipe for first time (totalRatings: 0 → 1) ✓
2. Another user rates recipe (1 → 2) ✓
3. First user changes rating (stays at 2, not 3) ✓
4. Verify average recalculates correctly ✓

### **Test Case 3: Concurrent Updates**

1. Multiple users favorite simultaneously ✓
2. Counter increments correctly (no race condition) ✓
3. Use atomic operations to ensure data integrity ✓

---

## 🚨 Important Notes

### **1. Use Atomic Operations**

❌ **Don't do this** (race condition):

```typescript
const recipe = await Recipe.findById(recipeId);
recipe.totalFavorites += 1;
await recipe.save();
```

✅ **Do this instead** (atomic):

```typescript
await Recipe.updateOne({ _id: recipeId }, { $inc: { totalFavorites: 1 } });
```

### **2. Handle Edge Cases**

- Counter should never go below 0
- Handle deleted favorites/ratings in cleanup
- Consider soft-deletes vs hard-deletes

### **3. Performance Considerations**

- Use database indexes on `recipeId` in favorites/ratings tables
- Consider caching recipe stats for high-traffic recipes
- Update stats asynchronously if needed (with eventual consistency)

---

## 📈 API Response Examples

### **Before** (Missing stats):

```json
{
  "id": "recipe123",
  "title": "Chocolate Cake",
  "averageRating": 4.5,
  "totalRatings": null, // ❌ Missing
  "totalFavorites": null // ❌ Missing
}
```

### **After** (With stats):

```json
{
  "id": "recipe123",
  "title": "Chocolate Cake",
  "averageRating": 4.5,
  "totalRatings": 127, // ✅ Frontend animates this
  "totalFavorites": 89 // ✅ Frontend animates this
}
```

---

## 🎯 Frontend Behavior

### **With Backend Stats** (Ideal):

- ✅ Shows accurate, real-time counts
- ✅ Animates from current → new value smoothly
- ✅ Rating distribution updates correctly

### **Without Backend Stats** (Graceful Fallback):

- ⚠️ Shows "0" or "N/A" for counters
- ⚠️ Still functional, but less impressive
- ⚠️ Distribution won't be accurate

---

## 🛠️ Implementation Priority

### **High Priority** (Required for full functionality):

1. ✅ Add `totalFavorites` and `totalRatings` fields to Recipe schema
2. ✅ Update favorite toggle to increment/decrement counter
3. ✅ Update rating creation to increment counter (new ratings only)
4. ✅ Return these fields in Recipe GET endpoint

### **Medium Priority** (Nice to have):

1. 🔄 Migration script for existing data
2. 🔄 Cleanup script to recalculate if counters drift
3. 🔄 Admin endpoint to manually fix counters

### **Low Priority** (Future enhancements):

1. 💡 Cache recipe stats in Redis
2. 💡 Real-time WebSocket updates
3. 💡 Analytics dashboard for recipe performance

---

## 📞 Questions?

If you need help implementing any of these backend changes:

1. Check your backend framework docs (NestJS/Spring Boot)
2. Ensure atomic operations for counters
3. Test with multiple concurrent users
4. Monitor database performance

---

**Status**: ⏳ **Backend implementation needed**

Once the backend returns `totalFavorites` and `totalRatings`, the frontend will automatically display and animate them in real-time! 🚀
