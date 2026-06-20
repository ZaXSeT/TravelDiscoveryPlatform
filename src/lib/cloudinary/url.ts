// Image resolver (07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md §7).
// Production: Cloudinary delivery with f_auto/q_auto and a fill crop.
// Dev (no Cloudinary cloud configured): deterministic placeholder so the guest
// experience renders immediately. Same public id -> same image (stable demo).

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface ImageOptions {
  w: number;
  h: number;
}

export function imageUrl(publicId: string, { w, h }: ImageOptions): string {
  if (cloud) {
    const t = `f_auto,q_auto,c_fill,g_auto,w_${w},h_${h}`;
    return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${publicId}`;
  }
  // Deterministic dev placeholder using realistic Unsplash URLs.
  const idMap: Record<string, string[]> = {
    'bali': [
      'https://images.unsplash.com/photo-1624935851312-845758a99160',
      'https://images.unsplash.com/photo-1752555642487-064415bc39dd',
      'https://images.unsplash.com/photo-1779430321327-845ddbf9d5ee',
      'https://images.unsplash.com/photo-1760754726798-62946c114497',
      'https://images.unsplash.com/photo-1779430321368-8cd25e4bfc65',
      'https://images.unsplash.com/photo-1778815079040-103c6022ff8b',
      'https://images.unsplash.com/photo-1766932189685-f840e6590291',
      'https://images.unsplash.com/photo-1775829245089-64b242884cd3',
      'https://images.unsplash.com/photo-1730700032358-6609ebc93e34',
      'https://images.unsplash.com/photo-1774960693655-33ca35130bbd',
      'https://images.unsplash.com/photo-1771766995256-1618791109d5',
      'https://images.unsplash.com/photo-1730700032352-172cbe209b6b',
      'https://images.unsplash.com/photo-1752769194803-8c75d32ac4fa',
      'https://images.unsplash.com/photo-1731924823489-6db5266be75d',
      'https://images.unsplash.com/photo-1766854269605-bd06cb72217e'
    ],
    'tokyo': [
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8',
      'https://images.unsplash.com/photo-1604928141064-207cea6f571f',
      'https://images.unsplash.com/photo-1551322120-c697cf88fbdc',
      'https://images.unsplash.com/photo-1584660470766-20ac1a28c7fe',
      'https://images.unsplash.com/photo-1606044466411-207a9a49711f',
      'https://images.unsplash.com/photo-1593839154339-377e24b3ba32',
      'https://images.unsplash.com/photo-1718967917204-b359a7b6a742',
      'https://images.unsplash.com/photo-1558240077-e33b10a16a64',
      'https://images.unsplash.com/photo-1739408793023-9d09533e6d25',
      'https://images.unsplash.com/photo-1670233449318-2ddb73e062e3',
      'https://images.unsplash.com/photo-1618397806621-290788301ced',
      'https://images.unsplash.com/photo-1531219435494-8e90d22adc1e',
      'https://images.unsplash.com/photo-1698742324562-1c2ed86eb1f6',
      'https://images.unsplash.com/photo-1505814360303-5bfcf2a8acb6',
      'https://images.unsplash.com/photo-1595672410691-67ca64d681d9'
    ],
    'paris': [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      'https://images.unsplash.com/photo-1550340499-a6c60fc8287c',
      'https://images.unsplash.com/photo-1549144511-f099e773c147',
      'https://images.unsplash.com/photo-1431274172761-fca41d930114',
      'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5',
      'https://images.unsplash.com/photo-1609971757431-439cf7b4141b',
      'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f',
      'https://images.unsplash.com/photo-1503917988258-f87a78e3c995',
      'https://images.unsplash.com/photo-1603378995290-8d4ce0495ddd',
      'https://images.unsplash.com/photo-1526821799652-2dc51675628e',
      'https://images.unsplash.com/photo-1583265266785-aab9e443ee68',
      'https://images.unsplash.com/photo-1581262177533-1b1760b87952',
      'https://images.unsplash.com/photo-1524396309943-e03f5249f002'
    ],
    'new-york': [
      'https://images.unsplash.com/photo-1496588152823-86ff7695e68f',
      'https://images.unsplash.com/photo-1543716091-a840c05249ec',
      'https://images.unsplash.com/photo-1546436836-07a91091f160',
      'https://images.unsplash.com/flagged/photo-1575597255483-55f2afb6f42c',
      'https://images.unsplash.com/photo-1541336032412-2048a678540d',
      'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785',
      'https://images.unsplash.com/photo-1602940659805-770d1b3b9911',
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2',
      'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90',
      'https://images.unsplash.com/photo-1572402554573-3380b6197404',
      'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee',
      'https://images.unsplash.com/photo-1448317846460-907988886b33',
      'https://images.unsplash.com/photo-1476837754190-8036496cea40',
      'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7'
    ],
    'switzerland': [
      'https://images.unsplash.com/photo-1521292270410-a8c4d716d518',
      'https://images.unsplash.com/photo-1607585011081-241d2bacb7de',
      'https://images.unsplash.com/photo-1628415491140-4d1108dc1045',
      'https://images.unsplash.com/photo-1520631023082-a5fe1cf21c5f',
      'https://images.unsplash.com/photo-1752957330472-bc92ba1f28a3',
      'https://images.unsplash.com/photo-1667682343189-35937293fb66',
      'https://images.unsplash.com/photo-1566475955255-404134a79aeb',
      'https://images.unsplash.com/photo-1719343112563-f121bae8daf0',
      'https://images.unsplash.com/photo-1564703821142-e88574e6cfa8',
      'https://images.unsplash.com/photo-1565689517266-dc2ba981c797',
      'https://images.unsplash.com/photo-1628062203973-88811f7fb705',
      'https://images.unsplash.com/photo-1648230122706-4494d7e1a661',
      'https://images.unsplash.com/photo-1719343111824-dd4a0ee56934',
      'https://images.unsplash.com/photo-1638658979209-adcd6df598b9',
      'https://images.unsplash.com/photo-1686727371370-52fc74092b94'
    ],
    hero: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
      "https://images.unsplash.com/photo-1537819191377-d3305ffddce4",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    ],
    fuji: [
      "https://images.unsplash.com/photo-1528164344705-47542687000d",
      "https://images.unsplash.com/photo-1570459027562-4a916cc6113f"
    ],
    globe: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2"
    ],
    landscape: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
    ],
    'kyoto': [
      'https://images.unsplash.com/photo-1713781913501-832e39d95a6d',
      'https://images.unsplash.com/photo-1705923401054-b06daf310fc3',
      'https://images.unsplash.com/photo-1702594902217-8ce7712f3fad',
      'https://images.unsplash.com/photo-1779689247909-c3712c428db6',
      'https://images.unsplash.com/photo-1763419161847-68639534f37e',
      'https://images.unsplash.com/photo-1769841897262-dd55401996a7',
      'https://images.unsplash.com/photo-1763783334685-4aef1c96375a',
      'https://images.unsplash.com/photo-1763419161838-18917d9a6ee4',
      'https://images.unsplash.com/photo-1763419162769-926412de685e',
      'https://images.unsplash.com/photo-1769841897210-c748eab52ac4',
      'https://images.unsplash.com/photo-1767334850072-4635b5dd66f2',
      'https://images.unsplash.com/photo-1763783334029-8abdcb9b3f95',
      'https://images.unsplash.com/photo-1781500415360-774113102bfa',
      'https://images.unsplash.com/photo-1777648939922-8f4763039f10',
      'https://images.unsplash.com/photo-1728200696391-1fcab7f5a03b',
      'https://images.unsplash.com/photo-1712661834265-77650cb9070a',
      'https://images.unsplash.com/photo-1771030666267-606201f5b6db'
    ],
    'seoul': [
      'https://images.unsplash.com/photo-1685761341534-b155d516eb80',
      'https://images.unsplash.com/photo-1662300835077-73c417630ff5',
      'https://images.unsplash.com/photo-1624079569473-fbb97980a4f1',
      'https://images.unsplash.com/photo-1634719887228-9936cb61cba4',
      'https://images.unsplash.com/photo-1684847412161-9c846be62363',
      'https://images.unsplash.com/photo-1637070875173-1ecab5fff748',
      'https://images.unsplash.com/photo-1635686692794-b0ce6337386b',
      'https://images.unsplash.com/photo-1472387040940-3ae0cdbf127d',
      'https://images.unsplash.com/photo-1684847413986-940679c536ce',
      'https://images.unsplash.com/photo-1704545007536-e96a57691e08',
      'https://images.unsplash.com/photo-1648900451399-63bf1d6c0621',
      'https://images.unsplash.com/photo-1702738684407-9ba8a0ecfc80',
      'https://images.unsplash.com/photo-1702395664559-99d11de24e76',
      'https://images.unsplash.com/photo-1691405528149-3151867c3e8d',
      'https://images.unsplash.com/photo-1741311653793-f8581cff30a8'
    ],
    'bangkok': [
      'https://images.unsplash.com/photo-1613672803979-a6edfc5a179b',
      'https://images.unsplash.com/photo-1531169628939-e84f860fa5d6',
      'https://images.unsplash.com/photo-1589932896376-5244c8898269',
      'https://images.unsplash.com/photo-1592117984084-15bc78969be2',
      'https://images.unsplash.com/photo-1546228139-87f5312cac42',
      'https://images.unsplash.com/photo-1612161330631-9186c513de7f',
      'https://images.unsplash.com/photo-1553831755-2a0a5370efe4',
      'https://images.unsplash.com/photo-1714672709462-de21a12a1339',
      'https://images.unsplash.com/photo-1583511416766-083ba12de77c',
      'https://images.unsplash.com/photo-1558847345-289a92f80ddb',
      'https://images.unsplash.com/photo-1568508432206-7541b535f84c',
      'https://images.unsplash.com/photo-1558655838-6895927b8340',
      'https://images.unsplash.com/photo-1644027612496-93dfa3d6a3ae',
      'https://images.unsplash.com/photo-1575348021159-aa1d0d95eac5',
      'https://images.unsplash.com/photo-1639379090837-309066ebbe2f'
    ],
    'singapore': [
      'https://images.unsplash.com/photo-1565967511849-76a60a516170',
      'https://images.unsplash.com/photo-1768117173988-5ebfdde4fdd3',
      'https://images.unsplash.com/photo-1763621616005-3de35f483cca',
      'https://images.unsplash.com/photo-1556895939-05fab7d04e3b',
      'https://images.unsplash.com/photo-1761745470633-02f0e5676f77',
      'https://images.unsplash.com/photo-1775224017826-d16b44af5b12',
      'https://images.unsplash.com/photo-1781428643215-c094c69b01b7',
      'https://images.unsplash.com/photo-1771556087197-6503467dd461',
      'https://images.unsplash.com/photo-1682951957318-974c5edb713a',
      'https://images.unsplash.com/photo-1767014738062-0a090b47a918',
      'https://images.unsplash.com/photo-1758391792907-47cda6f85ee4',
      'https://images.unsplash.com/photo-1710166699214-ca25584ba5aa',
      'https://images.unsplash.com/photo-1677798690777-b50e162bd030',
      'https://images.unsplash.com/photo-1781428643252-f2bdbe791b23',
      'https://images.unsplash.com/photo-1683041056058-0bb107753152'
    ],
    'hanoi': [
      'https://images.unsplash.com/photo-1695927521861-6f74917a453e',
      'https://images.unsplash.com/photo-1707132940730-00deb43f7b2a',
      'https://images.unsplash.com/photo-1699571182695-25c57138de98',
      'https://images.unsplash.com/photo-1699571182671-02a7bf75475d',
      'https://images.unsplash.com/photo-1744822685924-456655c8e9cd',
      'https://images.unsplash.com/photo-1722807359333-5a7885d67675',
      'https://images.unsplash.com/photo-1769133012767-73d2551624f2',
      'https://images.unsplash.com/photo-1758485780231-0557ef8ff7de',
      'https://images.unsplash.com/photo-1773737689252-ab0ff88befad',
      'https://images.unsplash.com/photo-1693368022858-8634d99dc345',
      'https://images.unsplash.com/photo-1775151870655-e81f5022ee74',
      'https://images.unsplash.com/photo-1697386657516-c2651c097a09',
      'https://images.unsplash.com/photo-1734220476344-c165ecc8b5c1',
      'https://images.unsplash.com/photo-1773737689293-23646ab35ff3',
      'https://images.unsplash.com/photo-1762333329631-5c5941fec44c',
      'https://images.unsplash.com/photo-1758485780327-f53204cb5b6c',
      'https://images.unsplash.com/photo-1764000858269-28d9f0f72894',
      'https://images.unsplash.com/photo-1775151870707-1e0afc68b7da'
    ],
    'rome': [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
      'https://images.unsplash.com/photo-1704915332184-68202025c9ba',
      'https://images.unsplash.com/photo-1512064444180-54b51a475aa7',
      'https://images.unsplash.com/photo-1511163262182-1b04e5fa4caa',
      'https://images.unsplash.com/photo-1724398915427-edc535c546fe',
      'https://images.unsplash.com/photo-1740606947209-41e48e994048',
      'https://images.unsplash.com/photo-1734219812963-c31e7a5c37f0',
      'https://images.unsplash.com/photo-1715806175155-e71328edf12a',
      'https://images.unsplash.com/photo-1717778264075-8c6eb93676f9',
      'https://images.unsplash.com/photo-1640295751907-3c20ffe160bb',
      'https://images.unsplash.com/photo-1641832711358-f74cc305eae2',
      'https://images.unsplash.com/photo-1662504516102-8aaad4d459d2',
      'https://images.unsplash.com/photo-1727524935399-cabe32567f78',
      'https://images.unsplash.com/photo-1724259624123-36661eb622b3',
      'https://images.unsplash.com/photo-1724259622317-1ef9dafc7017'
    ],
    'amsterdam': [
      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017',
      'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c',
      'https://images.unsplash.com/photo-1459679749680-18eb1eb37418',
      'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4',
      'https://images.unsplash.com/photo-1580996378027-23040f16f157',
      'https://images.unsplash.com/photo-1583295125721-766a0088cd3f',
      'https://images.unsplash.com/photo-1605101100278-5d1deb2b6498',
      'https://images.unsplash.com/photo-1576924542622-772281b13aa8',
      'https://images.unsplash.com/photo-1536880756060-98a6a140f0a7',
      'https://images.unsplash.com/photo-1605704320412-5c3255bf47a9',
      'https://images.unsplash.com/photo-1622015524070-5ea7caac2643',
      'https://images.unsplash.com/photo-1558551649-e44c8f992010',
      'https://images.unsplash.com/photo-1517736996303-4eec4a66bb17',
      'https://images.unsplash.com/photo-1529943247435-a5974e63d6e4',
      'https://images.unsplash.com/photo-1604998946269-f8d8385d2b40'
    ],
    'barcelona': [
      'https://images.unsplash.com/photo-1706109303544-e19464c17d7a',
      'https://images.unsplash.com/photo-1666990295454-6635caa4095e',
      'https://images.unsplash.com/photo-1666990286230-fbafd4376e30',
      'https://images.unsplash.com/photo-1711548646494-bdab8c12fc40',
      'https://images.unsplash.com/photo-1764107183244-0cef642a99a9',
      'https://images.unsplash.com/photo-1759941030423-728417b4bd41',
      'https://images.unsplash.com/photo-1665264555082-b0b7c2d848e8',
      'https://images.unsplash.com/photo-1711548646321-fa0d380f1de0',
      'https://images.unsplash.com/photo-1711548646526-d7171017921d',
      'https://images.unsplash.com/photo-1767362667019-7ee099089fe1',
      'https://images.unsplash.com/photo-1723497678097-5105c26586e8',
      'https://images.unsplash.com/photo-1643890883741-a5da5f4d5970',
      'https://images.unsplash.com/photo-1758471206484-0eaa2568320c',
      'https://images.unsplash.com/photo-1758471206463-3971536e61c7',
      'https://images.unsplash.com/photo-1769776036168-c61ff13939f0'
    ],
    'prague': [
      'https://images.unsplash.com/photo-1564511287568-54483b52a35e',
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439',
      'https://images.unsplash.com/photo-1600623471616-8c1966c91ff6',
      'https://images.unsplash.com/photo-1571778200037-250828fe3eee',
      'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef',
      'https://images.unsplash.com/photo-1616038242814-a6eac7845d88',
      'https://images.unsplash.com/photo-1580852710598-96912fc48065',
      'https://images.unsplash.com/photo-1503410781609-75b1d892dd28',
      'https://images.unsplash.com/photo-1541849546-216549ae216d',
      'https://images.unsplash.com/photo-1553713822-6b472e98ef99',
      'https://images.unsplash.com/photo-1535723129303-6a7635e28cd3',
      'https://images.unsplash.com/photo-1562624475-96c2bc08fab9',
      'https://images.unsplash.com/photo-1715388302950-6ad4ad794d07',
      'https://images.unsplash.com/photo-1581200309617-836d0d7f9c04',
      'https://images.unsplash.com/photo-1581525046703-e553ee7b3de9'
    ],
    'vienna': [
      'https://images.unsplash.com/photo-1780840918291-8308d683cda7',
      'https://images.unsplash.com/photo-1779903942719-09c427b83db3',
      'https://images.unsplash.com/photo-1778015459207-a1574e17b8b8',
      'https://images.unsplash.com/photo-1781157980401-5def730c9664',
      'https://images.unsplash.com/photo-1761610777709-225a847031cf',
      'https://images.unsplash.com/photo-1759960034368-275a6002e540',
      'https://images.unsplash.com/photo-1770755362807-233bc12b9dee',
      'https://images.unsplash.com/photo-1774126512746-3380b802b7ba',
      'https://images.unsplash.com/photo-1723713297097-198cf1591e0d',
      'https://images.unsplash.com/photo-1670791158516-650ec4ad07c7',
      'https://images.unsplash.com/photo-1670791332518-ecc5b6c96e80',
      'https://images.unsplash.com/photo-1720191457662-c92e851c1697',
      'https://images.unsplash.com/photo-1759953061148-459c2f728163',
      'https://images.unsplash.com/photo-1765285340683-ce92eb734bf1',
      'https://images.unsplash.com/photo-1779803727334-9db8cd51c84f'
    ],
    'san-francisco': [
      'https://images.unsplash.com/photo-1719858403364-83f7442a197e',
      'https://images.unsplash.com/photo-1652218462501-2f7316458aab',
      'https://images.unsplash.com/photo-1719858403527-e171e237fe59',
      'https://images.unsplash.com/photo-1719858403457-c03d19d28e86',
      'https://images.unsplash.com/photo-1553922796-9ac61f7c71a7',
      'https://images.unsplash.com/photo-1618414440968-e80b28bcf2c2',
      'https://images.unsplash.com/photo-1721977626352-912753caa4fe',
      'https://images.unsplash.com/photo-1685643848076-6f7afbfdfbdb',
      'https://images.unsplash.com/photo-1765868895415-3a1c488f9521',
      'https://images.unsplash.com/photo-1685643532776-701d26212e94',
      'https://images.unsplash.com/photo-1644037095278-5de764c3c1a2',
      'https://images.unsplash.com/photo-1765609118550-25bde8c8d862',
      'https://images.unsplash.com/photo-1770438678862-fbc874701b9e',
      'https://images.unsplash.com/photo-1719858403473-303b271f154b',
      'https://images.unsplash.com/photo-1774760838775-dc7e20452889'
    ],
    'vancouver': [
      'https://images.unsplash.com/photo-1708392310993-feac72ff1dae',
      'https://images.unsplash.com/photo-1709863373143-e29e1d8352a3',
      'https://images.unsplash.com/photo-1697985808899-3a2b87686677',
      'https://images.unsplash.com/photo-1721020914050-6cdaeede12cd',
      'https://images.unsplash.com/photo-1707537643788-acd2822e68cb',
      'https://images.unsplash.com/photo-1768766524671-0d6bb6da6c4c',
      'https://images.unsplash.com/photo-1778403040365-ec23cf453907',
      'https://images.unsplash.com/photo-1768881356792-6702fefe1014',
      'https://images.unsplash.com/photo-1732046351085-43247c92c8a1',
      'https://images.unsplash.com/photo-1776397247354-e0adfb650224',
      'https://images.unsplash.com/photo-1731321680653-542179e90f02',
      'https://images.unsplash.com/photo-1778843513396-3734c31856d8',
      'https://images.unsplash.com/photo-1774509914106-ea9a0c0f175b',
      'https://images.unsplash.com/photo-1696505872194-56afddc093d9',
      'https://images.unsplash.com/photo-1698889223670-3da5653e195d'
    ],
    'toronto': [
      'https://images.unsplash.com/photo-1517935706615-2717063c2225',
      'https://images.unsplash.com/photo-1507992781348-310259076fe0',
      'https://images.unsplash.com/photo-1569982615761-66697da68502',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e',
      'https://images.unsplash.com/photo-1586576782138-19304c43d0e1',
      'https://images.unsplash.com/photo-1543962226-818f4301073f',
      'https://images.unsplash.com/photo-1517090504586-fde19ea6066f',
      'https://images.unsplash.com/photo-1559869824-929df9dab35e',
      'https://images.unsplash.com/photo-1542704792-e30dac463c90',
      'https://images.unsplash.com/photo-1578010908802-cd7e5cd853c9',
      'https://images.unsplash.com/photo-1603466184840-715063d3e1e3',
      'https://images.unsplash.com/photo-1632857997897-9418428d7368',
      'https://images.unsplash.com/photo-1503505129851-abaf7f6140b4',
      'https://images.unsplash.com/photo-1515983206477-c0df29b37a27',
      'https://images.unsplash.com/photo-1610509659326-b35b9b15bf51'
    ],
    'chicago': [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
      'https://images.unsplash.com/photo-1494522855154-9297ac14b55f',
      'https://images.unsplash.com/photo-1714662660476-022bfd34cf44',
      'https://images.unsplash.com/photo-1596250410216-1ac77dc208e3',
      'https://images.unsplash.com/photo-1597933534024-debb6104af15',
      'https://images.unsplash.com/photo-1563718944-758794a56b34',
      'https://images.unsplash.com/photo-1524168272322-bf73616d9cb5',
      'https://images.unsplash.com/photo-1622180790662-cdb3cedaa463',
      'https://images.unsplash.com/photo-1467226632440-65f0b4957563',
      'https://images.unsplash.com/photo-1575380591643-b2c92368dc6d',
      'https://images.unsplash.com/photo-1631548637245-043803a8b776',
      'https://images.unsplash.com/photo-1533658280853-e4a10c25a30d',
      'https://images.unsplash.com/photo-1493134799591-2c9eed26201a',
      'https://images.unsplash.com/photo-1479520997871-76c75ea2b67a',
      'https://images.unsplash.com/photo-1627140583146-23077865a2a8'
    ],
    'sydney': [
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
      'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8',
      'https://images.unsplash.com/photo-1523428096881-5bd79d043006',
      'https://images.unsplash.com/photo-1598948485421-33a1655d3c18',
      'https://images.unsplash.com/photo-1524562865630-b991c6c2f261',
      'https://images.unsplash.com/photo-1616128618694-96e9e896ecb7',
      'https://images.unsplash.com/photo-1704788623366-8cd4d7285e60',
      'https://images.unsplash.com/photo-1595740229246-cfdda61917c6',
      'https://images.unsplash.com/photo-1689834677356-441a39b353ab',
      'https://images.unsplash.com/photo-1513343987712-5da15ea2a9bb',
      'https://images.unsplash.com/photo-1584772121849-56c717d6c542',
      'https://images.unsplash.com/photo-1562791098-df1ae65dee79',
      'https://images.unsplash.com/photo-1551783841-0271a5f7c868',
      'https://images.unsplash.com/photo-1548565495-a692bd1c1d1c',
      'https://images.unsplash.com/photo-1531033056439-63578c0d9f22'
    ],
    'melbourne': [
      'https://images.unsplash.com/photo-1720044282356-e319c686d209',
      'https://images.unsplash.com/photo-1766766784935-a89ae5eadf4f',
      'https://images.unsplash.com/photo-1764981965825-295245469923',
      'https://images.unsplash.com/photo-1747378162917-5896dc8014cd',
      'https://images.unsplash.com/photo-1747378162922-1587c26b5517',
      'https://images.unsplash.com/photo-1764981965596-ca1acdb69368',
      'https://images.unsplash.com/photo-1775308858334-f75fb156be10',
      'https://images.unsplash.com/photo-1775308858134-4502bf78b7a9',
      'https://images.unsplash.com/photo-1775308858186-3536fb69a39a',
      'https://images.unsplash.com/photo-1778218499974-a286da5c97fa',
      'https://images.unsplash.com/photo-1707288190500-bef63bc30356',
      'https://images.unsplash.com/photo-1763461783429-3dc585eec836',
      'https://images.unsplash.com/photo-1707566288756-514b7658de88',
      'https://images.unsplash.com/photo-1766050588758-2e894d0f33e7',
      'https://images.unsplash.com/photo-1771085612884-e83d617db360'
    ],
    'queenstown': ['https://images.unsplash.com/photo-1547314283-befb6cc5cf29', 'https://images.unsplash.com/photo-1512017615494-fdf6146235ff', 'https://images.unsplash.com/photo-1600476019922-fb69c71b0b53', 'https://images.unsplash.com/photo-1718398892734-6948c85416c8', 'https://images.unsplash.com/photo-1556878516-61356c874f03', 'https://images.unsplash.com/photo-1515253648320-6d70d901f0ac', 'https://images.unsplash.com/photo-1611973880185-103299988b6f', 'https://images.unsplash.com/photo-1705927161510-0e84f8e1901e', 'https://images.unsplash.com/photo-1740658642224-3c37bab6e56d', 'https://images.unsplash.com/photo-1638389702775-97a9a4a9c12c', 'https://images.unsplash.com/photo-1590707404699-2f2f79744e59', 'https://images.unsplash.com/photo-1714142744624-4667e4e284ec', 'https://images.unsplash.com/photo-1515253798720-22ee8c9e9f97', 'https://images.unsplash.com/photo-1570174032567-7375b65d1e67', 'https://images.unsplash.com/photo-1755446133354-96486cc15900'],
    'dubai': [
      'https://images.unsplash.com/photo-1683173363016-05ad4909906c',
      'https://images.unsplash.com/photo-1726533765829-67f0313ab064',
      'https://images.unsplash.com/photo-1766526578439-f4bc54c079f5',
      'https://images.unsplash.com/photo-1758698848798-595ec76587e3',
      'https://images.unsplash.com/photo-1772175125684-4b42083464fa',
      'https://images.unsplash.com/photo-1759495985650-3a35a68ca1f7',
      'https://images.unsplash.com/photo-1726533765277-0008970a61b2',
      'https://images.unsplash.com/photo-1758819085466-59120c33ac5e',
      'https://images.unsplash.com/photo-1772175100024-803031e89b41',
      'https://images.unsplash.com/photo-1764603852093-6e4918c3197a',
      'https://images.unsplash.com/photo-1726533765802-8a9c6d746a2a',
      'https://images.unsplash.com/photo-1722936301903-fa6ce2a47259',
      'https://images.unsplash.com/photo-1780049345799-b91f74af9095',
      'https://images.unsplash.com/photo-1719332402044-06ae0b035ffc',
      'https://images.unsplash.com/photo-1765110979198-d5c3c39aab87'
    ],
    'istanbul': [
      'https://images.unsplash.com/photo-1617002424329-cdf48dadb1ad',
      'https://images.unsplash.com/photo-1616777156138-0c18fd11fbb2',
      'https://images.unsplash.com/photo-1612293507534-9c88e23b7fd9',
      'https://images.unsplash.com/photo-1642886450202-0cfda7d1017f',
      'https://images.unsplash.com/photo-1734941613888-e3980e34e663',
      'https://images.unsplash.com/photo-1736299298182-f90904857d49',
      'https://images.unsplash.com/photo-1736299294018-289f0663c4f6',
      'https://images.unsplash.com/photo-1777172427664-06f5e24ea1fb',
      'https://images.unsplash.com/photo-1736299299439-f446c203b417',
      'https://images.unsplash.com/photo-1736299294041-f8e44d04474e',
      'https://images.unsplash.com/photo-1736299297925-da1c8b1e2072',
      'https://images.unsplash.com/photo-1745049483157-b49ca917a63a',
      'https://images.unsplash.com/photo-1732365898295-4af12ea0dca3',
      'https://images.unsplash.com/photo-1734941594104-90ecaa925cd8',
      'https://images.unsplash.com/photo-1734941594132-a9872dfa7a7f'
    ],
    'cape-town': [
      'https://images.unsplash.com/photo-1730234348946-652185b21626',
      'https://images.unsplash.com/photo-1730234350073-245546fc5473',
      'https://images.unsplash.com/photo-1730234349829-989aa8cebf0d',
      'https://images.unsplash.com/photo-1730234348572-0d2ab3902e9a',
      'https://images.unsplash.com/photo-1770553129454-dcc53f92069f',
      'https://images.unsplash.com/photo-1774971295704-dad78696be34',
      'https://images.unsplash.com/photo-1761400823907-d0454d0c5057',
      'https://images.unsplash.com/photo-1774887678592-4ab8260f3b94',
      'https://images.unsplash.com/photo-1779103946685-a516527bc6ec',
      'https://images.unsplash.com/photo-1770988966424-44646f5ac123',
      'https://images.unsplash.com/photo-1779709287894-d53ae55e142e',
      'https://images.unsplash.com/photo-1770553129485-99739edb534f',
      'https://images.unsplash.com/photo-1762529233988-496cf2732177',
      'https://images.unsplash.com/photo-1762332516607-cbb1434f3113',
      'https://images.unsplash.com/photo-1778053065990-0dc377631e6e'
    ],
    'marrakech': [
      'https://images.unsplash.com/photo-1597212618440-806262de4f6b',
      'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72',
      'https://images.unsplash.com/photo-1708823081494-3e5bbd2ce931',
      'https://images.unsplash.com/photo-1585004607620-fb4c44331e73',
      'https://images.unsplash.com/photo-1517821115309-2c35b3906a7b',
      'https://images.unsplash.com/photo-1517573847294-84690dbc5df8',
      'https://images.unsplash.com/photo-1624805098931-098c0d918b34',
      'https://images.unsplash.com/photo-1637531114994-ef00c3f54387',
      'https://images.unsplash.com/photo-1519396653448-212e3c1566aa',
      'https://images.unsplash.com/photo-1585391444542-62acc4f5fa46',
      'https://images.unsplash.com/photo-1585213303560-35a15f7b70a9',
      'https://images.unsplash.com/photo-1589306719793-0a78d2744e7b',
      'https://images.unsplash.com/photo-1740381969917-9d2039aaf49c',
      'https://images.unsplash.com/photo-1741918265297-510c428d04c3',
      'https://images.unsplash.com/photo-1629551752961-e5f80e382f08'
    ],
  };

  const lowerId = publicId.toLowerCase();
  
  // Simple hash to deterministically pick an image
  const hash = publicId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let baseUrl = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"; // Generic landscape fallback
  let matched = false;

  // Find the best matching keyword (prioritize longer keys like city names over generic 'hero')
  const keys = Object.keys(idMap).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lowerId.includes(key)) {
      const urls = idMap[key];
      if (urls && urls.length > 0) {
        baseUrl = urls[hash % urls.length] ?? baseUrl;
        matched = true;
        break;
      }
    }
  }

  // No city-specific match (e.g. Tier 2 explore destinations): pick from the full pool
  // of curated images by hash so each card still gets a varied, real travel photo.
  if (!matched) {
    const pool = Object.values(idMap).flat();
    baseUrl = pool[hash % pool.length] ?? baseUrl;
  }

  return `${baseUrl}?q=80&w=${w}&h=${h}&auto=format&fit=crop`;
}

export const usingPlaceholderImages = !cloud;
