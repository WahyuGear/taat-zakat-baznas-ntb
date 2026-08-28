"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calculator,
  Info,
  RotateCcw,
  BriefcaseBusiness,
  Coins,
  Wheat,
  Beef,
  Store,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type ZakatType =
  | "penghasilan"
  | "mal"
  | "pertanian"
  | "peternakan"
  | "perdagangan";

type IrrigationType = "alami" | "biaya";

type AnimalType = "kambing" | "sapi";

const NISAB_PENGHASILAN_BULANAN = 7_640_144;
const NISAB_PENGHASILAN_TAHUNAN = 91_681_728;

// Nisab harta/perdagangan menggunakan 85 gram emas.
// Nilai rupiahnya sengaja dibuat input agar dapat diperbarui
// mengikuti harga emas yang ditetapkan/dirujuk BAZNAS.
const DEFAULT_NISAB_HARTA = 85;

const NISAB_PERTANIAN_KG = 653;

const zakatTypes = [
  {
    id: "penghasilan" as ZakatType,
    title: "Penghasilan",
    description: "Gaji, honor & profesi",
    icon: BriefcaseBusiness,
  },
  {
    id: "mal" as ZakatType,
    title: "Zakat Mal",
    description: "Harta, emas & tabungan",
    icon: Coins,
  },
  {
    id: "pertanian" as ZakatType,
    title: "Pertanian",
    description: "Hasil panen",
    icon: Wheat,
  },
  {
    id: "peternakan" as ZakatType,
    title: "Peternakan",
    description: "Kambing & sapi",
    icon: Beef,
  },
  {
    id: "perdagangan" as ZakatType,
    title: "Perdagangan",
    description: "Aset usaha",
    icon: Store,
  },
];

const campaignSlug: Record<ZakatType, string> = {
  penghasilan: "zakat-penghasilan",
  mal: "zakat-mal",
  pertanian: "zakat-pertanian",
  peternakan: "zakat-peternakan",
  perdagangan: "zakat-perdagangan",
};

function parseNumber(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function formatInput(value: string) {
  const number = parseNumber(value);

  if (!number) {
    return "";
  }

  return new Intl.NumberFormat("id-ID").format(number);
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));
}

export default function ZakatCalculator() {
  const [type, setType] = useState<ZakatType>("penghasilan");

  /*
   * PENGHASILAN
   */
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [otherMonthlyIncome, setOtherMonthlyIncome] =
    useState("");

  /*
   * MAL
   */
  const [cash, setCash] = useState("");
  const [gold, setGold] = useState("");
  const [investment, setInvestment] = useState("");
  const [otherAssets, setOtherAssets] = useState("");
  const [malDebt, setMalDebt] = useState("");

  /*
   * PERTANIAN
   */
  const [harvestKg, setHarvestKg] = useState("");
  const [harvestValue, setHarvestValue] = useState("");
  const [irrigation, setIrrigation] =
    useState<IrrigationType>("alami");

  /*
   * PETERNAKAN
   */
  const [animalType, setAnimalType] =
    useState<AnimalType>("kambing");
  const [animalCount, setAnimalCount] = useState("");

  /*
   * PERDAGANGAN
   */
  const [tradeAssets, setTradeAssets] = useState("");
  const [tradeProfit, setTradeProfit] = useState("");
  const [tradeReceivables, setTradeReceivables] =
    useState("");
  const [tradeDebt, setTradeDebt] = useState("");

  /*
   * HARGA EMAS / NISAB HARTA
   *
   * Untuk sementara dibuat input agar admin nanti bisa
   * mengganti nilai nisab sesuai ketetapan BAZNAS terbaru.
   */
  const [goldPrice, setGoldPrice] = useState("");

  const [hasCalculated, setHasCalculated] =
    useState(false);

  const nisabHarta =
    parseNumber(goldPrice) > 0
      ? parseNumber(goldPrice) * DEFAULT_NISAB_HARTA
      : 0;

  const reset = () => {
    setMonthlyIncome("");
    setOtherMonthlyIncome("");

    setCash("");
    setGold("");
    setInvestment("");
    setOtherAssets("");
    setMalDebt("");

    setHarvestKg("");
    setHarvestValue("");

    setAnimalCount("");

    setTradeAssets("");
    setTradeProfit("");
    setTradeReceivables("");
    setTradeDebt("");

    setGoldPrice("");

    setHasCalculated(false);
  };

  const handleTypeChange = (newType: ZakatType) => {
    setType(newType);
    setHasCalculated(false);
  };

  const calculation = useMemo(() => {
    /*
     * ==========================================
     * ZAKAT PENGHASILAN
     * ==========================================
     *
     * BAZNAS RI 2026:
     * Nisab bulanan = Rp7.640.144
     * Nisab tahunan = Rp91.681.728
     * Kadar = 2,5%
     *
     * Penghasilan bulanan + penghasilan lain.
     */
    if (type === "penghasilan") {
      const salary = parseNumber(monthlyIncome);
      const other = parseNumber(otherMonthlyIncome);

      const monthlyTotal = salary + other;
      const annualTotal = monthlyTotal * 12;

      const eligible =
        monthlyTotal >= NISAB_PENGHASILAN_BULANAN;

      const zakat = eligible
        ? Math.floor(monthlyTotal * 0.025)
        : 0;

      return {
        zakat,
        eligible,
        basis: monthlyTotal,
        basisLabel: "Penghasilan per bulan",
        nisab: NISAB_PENGHASILAN_BULANAN,
        nisabLabel: "Nisab per bulan",
        rate: "2,5%",
        extra: `Penghasilan tahunan ${formatRupiah(
          annualTotal
        )}`,
      };
    }

    /*
     * ==========================================
     * ZAKAT MAL
     * ==========================================
     *
     * Komponen:
     * - uang/tunai
     * - emas
     * - investasi
     * - aset lain yang termasuk objek zakat
     * - dikurangi kewajiban/hutang
     *
     * Emas masuk ke Zakat Mal.
     */
    if (type === "mal") {
      const totalAssets =
        parseNumber(cash) +
        parseNumber(gold) +
        parseNumber(investment) +
        parseNumber(otherAssets);

      const debt = parseNumber(malDebt);

      const netAssets = Math.max(
        0,
        totalAssets - debt
      );

      const eligible =
        nisabHarta > 0 &&
        netAssets >= nisabHarta;

      const zakat = eligible
        ? Math.floor(netAssets * 0.025)
        : 0;

      return {
        zakat,
        eligible,
        basis: netAssets,
        basisLabel: "Harta bersih",
        nisab: nisabHarta,
        nisabLabel: "Nisab 85 gram emas",
        rate: "2,5%",
        extra:
          nisabHarta > 0
            ? `Nisab: ${formatRupiah(nisabHarta)}`
            : "Masukkan harga emas untuk menghitung nisab",
      };
    }

    /*
     * ==========================================
     * ZAKAT PERTANIAN
     * ==========================================
     *
     * Nisab:
     * 5 wasaq ≈ 653 kg hasil panen.
     *
     * Pengairan alami = 10%
     * Pengairan berbiaya = 5%
     *
     * Zakat dikeluarkan saat panen.
     */
    if (type === "pertanian") {
      const kg = Number(harvestKg) || 0;
      const value = parseNumber(harvestValue);

      const eligible =
        kg >= NISAB_PERTANIAN_KG;

      const rate =
        irrigation === "alami"
          ? 0.1
          : 0.05;

      const zakat = eligible
        ? Math.floor(value * rate)
        : 0;

      return {
        zakat,
        eligible,
        basis: value,
        basisLabel: "Nilai hasil panen",
        nisab: NISAB_PERTANIAN_KG,
        nisabLabel: "Nisab hasil panen",
        rate:
          irrigation === "alami"
            ? "10%"
            : "5%",
        extra: `${kg.toLocaleString(
          "id-ID"
        )} kg hasil panen`,
      };
    }

    /*
     * ==========================================
     * ZAKAT PETERNAKAN
     * ==========================================
     *
     * Tidak menggunakan 2,5%.
     *
     * Kambing:
     * 40-120 = 1 ekor
     * 121-200 = 2 ekor
     * 201-300 = 3 ekor
     * >300 = setiap tambahan 100 ekor +1
     *
     * Sapi:
     * 30-39 = 1 ekor anak sapi
     * 40-59 = belum masuk tabel ringkas ini
     * 60-69 = 2 ekor anak sapi
     * 70-79 = 1 jantan + 1 betina
     * 80-89 = 2 betina
     * 90-99 = 3 jantan
     * 100-109 = 1 betina + 2 jantan
     *
     * Untuk rentang yang belum bisa ditentukan
     * secara aman dari tabel, kita tidak mengarang.
     */
    if (type === "peternakan") {
      const count = Number(animalCount) || 0;

      let livestockZakat = "";

      if (animalType === "kambing") {
        if (count < 40) {
          livestockZakat = "Belum mencapai nisab";
        } else if (count <= 120) {
          livestockZakat = "1 ekor kambing";
        } else if (count <= 200) {
          livestockZakat = "2 ekor kambing";
        } else if (count <= 300) {
          livestockZakat = "3 ekor kambing";
        } else {
          const additional =
            Math.floor((count - 300) / 100);

          livestockZakat = `${3 + additional} ekor kambing`;
        }
      }

      if (animalType === "sapi") {
        if (count < 30) {
          livestockZakat = "Belum mencapai nisab";
        } else if (count <= 39) {
          livestockZakat =
            "1 ekor anak sapi betina";
        } else if (count <= 59) {
          livestockZakat =
            "Perlu verifikasi tabel nisab sapi";
        } else if (count <= 69) {
          livestockZakat =
            "2 ekor anak sapi jantan";
        } else if (count <= 79) {
          livestockZakat =
            "1 ekor anak sapi betina + 1 jantan";
        } else if (count <= 89) {
          livestockZakat =
            "2 ekor anak sapi betina";
        } else if (count <= 99) {
          livestockZakat =
            "3 ekor anak sapi jantan";
        } else if (count <= 109) {
          livestockZakat =
            "1 ekor anak sapi betina + 2 jantan";
        } else {
          livestockZakat =
            "Perlu verifikasi tabel nisab lengkap";
        }
      }

      const eligible =
        animalType === "kambing"
          ? count >= 40
          : count >= 30;

      return {
        zakat: 0,
        eligible,
        basis: count,
        basisLabel: "Jumlah ternak",
        nisab:
          animalType === "kambing"
            ? 40
            : 30,
        nisabLabel: "Nisab minimum",
        rate: livestockZakat,
        extra:
          "Zakat peternakan dibayarkan dalam bentuk ternak sesuai ketentuan.",
        livestockZakat,
      };
    }

    /*
     * ==========================================
     * ZAKAT PERDAGANGAN
     * ==========================================
     *
     * Mengikuti pendekatan BAZNAS:
     * aset lancar + laba + piutang
     * dikurangi kewajiban yang relevan.
     *
     * Nisab = 85 gram emas.
     * Kadar = 2,5%.
     */
    if (type === "perdagangan") {
      const assets = parseNumber(tradeAssets);
      const profit = parseNumber(tradeProfit);
      const receivables =
        parseNumber(tradeReceivables);
      const debt = parseNumber(tradeDebt);

      const netTradeAssets = Math.max(
        0,
        assets + profit + receivables - debt
      );

      const eligible =
        nisabHarta > 0 &&
        netTradeAssets >= nisabHarta;

      const zakat = eligible
        ? Math.floor(netTradeAssets * 0.025)
        : 0;

      return {
        zakat,
        eligible,
        basis: netTradeAssets,
        basisLabel: "Harta perdagangan bersih",
        nisab: nisabHarta,
        nisabLabel: "Nisab 85 gram emas",
        rate: "2,5%",
        extra:
          nisabHarta > 0
            ? `Nisab: ${formatRupiah(nisabHarta)}`
            : "Masukkan harga emas untuk menghitung nisab",
      };
    }

    return {
      zakat: 0,
      eligible: false,
      basis: 0,
      basisLabel: "",
      nisab: 0,
      nisabLabel: "",
      rate: "0%",
      extra: "",
    };
  }, [
    type,

    monthlyIncome,
    otherMonthlyIncome,

    cash,
    gold,
    investment,
    otherAssets,
    malDebt,

    harvestKg,
    harvestValue,
    irrigation,

    animalType,
    animalCount,

    tradeAssets,
    tradeProfit,
    tradeReceivables,
    tradeDebt,

    goldPrice,
    nisabHarta,
  ]);

  const campaignUrl = `/campaign/${campaignSlug[type]}?amount=${calculation.zakat}`;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Calculator size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Hitung Zakat
            </h1>

            <p className="text-sm text-slate-500">
              Hitung kewajiban zakat sesuai jenis harta.
            </p>
          </div>
        </div>
      </section>

      {/* JENIS ZAKAT */}
      <section className="rounded-[24px] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">
            Pilih Jenis Zakat
          </p>

          <span className="text-xs font-medium text-slate-400">
            5 jenis
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {zakatTypes.map((item) => {
            const Icon = item.icon;
            const active = type === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleTypeChange(item.id)
                }
                className={`rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                  active
                    ? "border-green-600 bg-green-50 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active
                      ? "bg-green-700 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <p
                  className={`mt-3 text-sm font-bold ${
                    active
                      ? "text-green-800"
                      : "text-slate-800"
                  }`}
                >
                  {item.title}
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================
          PENGHASILAN
      ========================================= */}
      {type === "penghasilan" && (
        <section className="rounded-[24px] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">
            Zakat Penghasilan
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            BAZNAS RI menetapkan nisab penghasilan
            tahun 2026 sebesar Rp7.640.144 per bulan.
            Kadar zakatnya 2,5%.
          </p>

          <MoneyInput
            label="Gaji / Penghasilan per Bulan"
            value={monthlyIncome}
            onChange={setMonthlyIncome}
            placeholder="10.000.000"
          />

          <MoneyInput
            label="Penghasilan Lain per Bulan"
            value={otherMonthlyIncome}
            onChange={setOtherMonthlyIncome}
            placeholder="0"
          />

          <div className="mt-4 rounded-2xl bg-green-50 p-4">
            <div className="flex justify-between text-xs">
              <span className="text-green-700">
                Nisab bulanan
              </span>

              <strong className="text-green-800">
                {formatRupiah(
                  NISAB_PENGHASILAN_BULANAN
                )}
              </strong>
            </div>

            <div className="mt-2 flex justify-between text-xs">
              <span className="text-green-700">
                Nisab tahunan
              </span>

              <strong className="text-green-800">
                {formatRupiah(
                  NISAB_PENGHASILAN_TAHUNAN
                )}
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          MAL
      ========================================= */}
      {type === "mal" && (
        <section className="rounded-[24px] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">
            Zakat Mal
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Zakat mal mencakup harta yang memenuhi
            syarat zakat seperti uang, emas, tabungan,
            investasi dan aset lainnya.
          </p>

          <MoneyInput
            label="Uang Tunai / Tabungan"
            value={cash}
            onChange={setCash}
            placeholder="0"
          />

          <MoneyInput
            label="Nilai Emas"
            value={gold}
            onChange={setGold}
            placeholder="0"
          />

          <MoneyInput
            label="Investasi / Surat Berharga"
            value={investment}
            onChange={setInvestment}
            placeholder="0"
          />

          <MoneyInput
            label="Aset Lain yang Termasuk Objek Zakat"
            value={otherAssets}
            onChange={setOtherAssets}
            placeholder="0"
          />

          <MoneyInput
            label="Hutang / Kewajiban yang Diperhitungkan"
            value={malDebt}
            onChange={setMalDebt}
            placeholder="0"
          />

          <MoneyInput
            label="Harga Emas per Gram"
            value={goldPrice}
            onChange={setGoldPrice}
            placeholder="Contoh: 2.000.000"
          />

          <div className="mt-4 flex gap-2 rounded-2xl bg-amber-50 p-3">
            <Info
              size={17}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-xs leading-5 text-amber-700">
              Nisab zakat mal menggunakan nilai
              setara 85 gram emas. Harga emas dapat
              diperbarui sesuai ketetapan yang digunakan
              BAZNAS.
            </p>
          </div>
        </section>
      )}

      {/* =========================================
          PERTANIAN
      ========================================= */}
      {type === "pertanian" && (
        <section className="rounded-[24px] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">
            Zakat Pertanian
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Zakat pertanian ditunaikan saat panen.
            Nisabnya sekitar 653 kg hasil panen.
          </p>

          <label className="mt-5 block text-sm font-bold text-slate-900">
            Hasil Panen
          </label>

          <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-green-500 focus-within:bg-white">
            <input
              type="number"
              min="0"
              value={harvestKg}
              onChange={(e) => {
                setHarvestKg(e.target.value);
                setHasCalculated(false);
              }}
              placeholder="Contoh: 1.000"
              className="w-full bg-transparent py-4 text-lg font-bold outline-none"
            />

            <span className="text-sm font-semibold text-slate-400">
              kg
            </span>
          </div>

          <MoneyInput
            label="Nilai Hasil Panen"
            value={harvestValue}
            onChange={setHarvestValue}
            placeholder="50.000.000"
          />

          <label className="mt-5 block text-sm font-bold text-slate-900">
            Sistem Pengairan
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <ChoiceButton
              active={irrigation === "alami"}
              onClick={() => {
                setIrrigation("alami");
                setHasCalculated(false);
              }}
              title="Pengairan Alami"
              description="Hujan / sumber alami"
              badge="10%"
            />

            <ChoiceButton
              active={irrigation === "biaya"}
              onClick={() => {
                setIrrigation("biaya");
                setHasCalculated(false);
              }}
              title="Pengairan Berbiaya"
              description="Irigasi / pompa"
              badge="5%"
            />
          </div>

          <div className="mt-4 rounded-2xl bg-green-50 p-4">
            <p className="text-xs leading-5 text-green-700">
              Nisab: sekitar 653 kg hasil panen.
              Jika memenuhi nisab, kadar zakat adalah
              10% untuk pengairan alami dan 5% untuk
              pengairan yang memerlukan biaya.
            </p>
          </div>
        </section>
      )}

      {/* =========================================
          PETERNAKAN
      ========================================= */}
      {type === "peternakan" && (
        <section className="rounded-[24px] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">
            Zakat Peternakan
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Zakat peternakan dihitung berdasarkan jenis
            dan jumlah ternak, bukan menggunakan tarif
            2,5%.
          </p>

          <label className="mt-5 block text-sm font-bold text-slate-900">
            Jenis Ternak
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <ChoiceButton
              active={animalType === "kambing"}
              onClick={() => {
                setAnimalType("kambing");
                setHasCalculated(false);
              }}
              title="Kambing / Domba"
              description="Nisab 40 ekor"
              badge="40 ekor"
            />

            <ChoiceButton
              active={animalType === "sapi"}
              onClick={() => {
                setAnimalType("sapi");
                setHasCalculated(false);
              }}
              title="Sapi / Kerbau"
              description="Nisab 30 ekor"
              badge="30 ekor"
            />
          </div>

          <label className="mt-5 block text-sm font-bold text-slate-900">
            Jumlah Ternak
          </label>

          <input
            type="number"
            min="0"
            value={animalCount}
            onChange={(e) => {
              setAnimalCount(e.target.value);
              setHasCalculated(false);
            }}
            placeholder="Masukkan jumlah ternak"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-bold outline-none focus:border-green-500 focus:bg-white"
          />

          <div className="mt-4 flex gap-2 rounded-2xl bg-amber-50 p-3">
            <Info
              size={17}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-xs leading-5 text-amber-700">
              Zakat peternakan berlaku dengan ketentuan
              nisab, haul dan kondisi ternak tertentu.
              Ternak untuk perdagangan dapat masuk
              perhitungan zakat perdagangan.
            </p>
          </div>
        </section>
      )}

      {/* =========================================
          PERDAGANGAN
      ========================================= */}
      {type === "perdagangan" && (
        <section className="rounded-[24px] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">
            Zakat Perdagangan
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Hitung harta perdagangan berdasarkan aset
            lancar, laba, piutang dan kewajiban yang
            diperhitungkan.
          </p>

          <MoneyInput
            label="Aset Lancar / Modal Usaha"
            value={tradeAssets}
            onChange={setTradeAssets}
            placeholder="100.000.000"
          />

          <MoneyInput
            label="Laba Usaha"
            value={tradeProfit}
            onChange={setTradeProfit}
            placeholder="20.000.000"
          />

          <MoneyInput
            label="Piutang yang Dapat Ditagih"
            value={tradeReceivables}
            onChange={setTradeReceivables}
            placeholder="0"
          />

          <MoneyInput
            label="Hutang / Kewajiban Jangka Pendek"
            value={tradeDebt}
            onChange={setTradeDebt}
            placeholder="0"
          />

          <MoneyInput
            label="Harga Emas per Gram"
            value={goldPrice}
            onChange={setGoldPrice}
            placeholder="Contoh: 2.000.000"
          />

          <div className="mt-4 rounded-2xl bg-green-50 p-4">
            <p className="text-xs leading-5 text-green-700">
              Nisab zakat perdagangan setara 85 gram
              emas. Setelah memenuhi nisab dan haul,
              kadar zakat yang digunakan adalah 2,5%.
            </p>
          </div>
        </section>
      )}

      {/* INFO */}
      <section className="flex gap-2 rounded-[20px] bg-slate-50 p-4">
        <Info
          size={18}
          className="mt-0.5 shrink-0 text-green-700"
        />

        <p className="text-xs leading-5 text-slate-600">
          Kalkulator ini mengikuti rujukan ketentuan
          zakat BAZNAS RI. Untuk kondisi khusus,
          konsultasikan perhitungan kepada amil zakat.
        </p>
      </section>

      {/* ACTION */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setHasCalculated(true)}
          className="flex-1 rounded-2xl bg-green-700 py-4 font-bold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 active:scale-[0.98]"
        >
          Hitung Zakat
        </button>

        <button
          type="button"
          onClick={reset}
          aria-label="Reset kalkulator"
          className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 active:scale-95"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* =========================================
          HASIL
      ========================================= */}
      {hasCalculated && (
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-green-700 to-green-500 p-6 text-white shadow-xl">
          {calculation.eligible ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />

                <p className="text-sm font-semibold text-green-50">
                  Memenuhi nisab
                </p>
              </div>

              {type === "peternakan" ? (
                <>
                  <p className="mt-3 text-sm text-green-100">
                    Kewajiban zakat:
                  </p>

                  <p className="mt-1 text-2xl font-extrabold">
                    {calculation.livestockZakat}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-green-50">
                    Zakat peternakan tidak dikonversi
                    menjadi nominal rupiah karena
                    kewajibannya berupa jenis dan jumlah
                    ternak sesuai nisab.
                  </p>

                  <Link
                    href={`/campaign/${campaignSlug[type]}`}
                    className="mt-5 block w-full rounded-2xl bg-white py-3.5 text-center font-bold text-green-700 transition hover:bg-green-50 active:scale-[0.98]"
                  >
                    Lihat Campaign Zakat
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-green-100">
                    Perkiraan zakat yang wajib ditunaikan
                  </p>

                  <p className="mt-1 text-3xl font-extrabold">
                    {formatRupiah(calculation.zakat)}
                  </p>

                  <div className="mt-5 border-t border-white/20 pt-4">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-green-100">
                        {calculation.basisLabel}
                      </span>

                      <span className="text-right font-bold">
                        {formatRupiah(calculation.basis)}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between gap-4 text-sm">
                      <span className="text-green-100">
                        {calculation.nisabLabel}
                      </span>

                      <span className="text-right font-bold">
                        {type === "pertanian"
                          ? `${calculation.nisab} kg`
                          : formatRupiah(
                              calculation.nisab
                            )}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between gap-4 text-sm">
                      <span className="text-green-100">
                        Kadar
                      </span>

                      <span className="font-bold">
                        {calculation.rate}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-green-100">
                    {calculation.extra}
                  </p>

                  <Link
                    href={campaignUrl}
                    className="mt-5 block w-full rounded-2xl bg-white py-3.5 text-center font-bold text-green-700 transition hover:bg-green-50 active:scale-[0.98]"
                  >
                    Tunaikan Zakat
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />

                <p className="text-sm font-semibold text-green-50">
                  Belum memenuhi nisab
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-green-50">
                Berdasarkan data yang dimasukkan,
                kewajiban zakat belum terpenuhi.
              </p>

              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-green-100">
                    Dasar perhitungan
                  </span>

                  <strong>
                    {type === "peternakan"
                      ? `${calculation.basis} ekor`
                      : type === "pertanian"
                      ? `${calculation.basis} kg`
                      : formatRupiah(
                          calculation.basis
                        )}
                  </strong>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-green-100">
                    Nisab
                  </span>

                  <strong>
                    {type === "peternakan"
                      ? `${calculation.nisab} ekor`
                      : type === "pertanian"
                      ? `${calculation.nisab} kg`
                      : calculation.nisab > 0
                      ? formatRupiah(
                          calculation.nisab
                        )
                      : "Belum ditentukan"}
                  </strong>
                </div>
              </div>

              {type === "peternakan" ? (
                <Link
                  href={`/campaign/${campaignSlug[type]}`}
                  className="mt-5 block w-full rounded-2xl bg-white py-3.5 text-center font-bold text-green-700 transition hover:bg-green-50"
                >
                  Tetap Salurkan Kebaikan
                </Link>
              ) : (
                <p className="mt-4 text-center text-xs text-green-100">
                  Anda tetap dapat bersedekah melalui
                  program BAZNAS NTB.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

/* =========================================
   MONEY INPUT
========================================= */

function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mt-5">
      <label className="block text-sm font-bold text-slate-900">
        {label}
      </label>

      <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-green-500 focus-within:bg-white">
        <span className="text-sm font-semibold text-slate-400">
          Rp
        </span>

        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            onChange(formatInput(e.target.value));
          }}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-4 text-lg font-bold text-slate-900 outline-none"
        />
      </div>
    </div>
  );
}

/* =========================================
   CHOICE BUTTON
========================================= */

function ChoiceButton({
  active,
  onClick,
  title,
  description,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
        active
          ? "border-green-600 bg-green-50 shadow-sm"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={`text-sm font-bold ${
              active
                ? "text-green-800"
                : "text-slate-800"
            }`}
          >
            {title}
          </p>

          <p className="mt-1 text-[11px] leading-4 text-slate-400">
            {description}
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold ${
            active
              ? "bg-green-700 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {badge}
        </span>
      </div>
    </button>
  );
}